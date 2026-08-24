import type { Prisma } from "@microintern/database";

import { v4 as uuidv4 } from 'uuid';
import { PrismaClient, OnboardingStatus } from '@microintern/database';
import { NotFoundError, ValidationError, InternalServerError } from '@/shared/errors/index.js';
import Tesseract from 'tesseract.js';
import { parse } from 'mrz';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { EncryptionService } from '@/shared/encryption.service.js';

export class OnboardingUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async generateUrl(superAdminId: string): Promise<string> {
    const token = uuidv4();
    await this.prisma.companyOnboarding.create({
      data: {
        token,
        superAdminId,
        status: 'PENDING'
      }
    });
    return token;
  }

  async validateToken(token: string) {
    const onboarding = await this.prisma.companyOnboarding.findUnique({
      where: { token }
    });
    if (!onboarding) throw new NotFoundError('Invalid onboarding token');
    
    if (onboarding.signatureUrl) {
      onboarding.signatureUrl = EncryptionService.decrypt(onboarding.signatureUrl);
    }
    if (onboarding.govDocUrls && Array.isArray(onboarding.govDocUrls)) {
      onboarding.govDocUrls = onboarding.govDocUrls.map(url => EncryptionService.decrypt(url as string));
    }
    return onboarding;
  }

  async submitData(token: string, data: any) {
    const onboarding = await this.validateToken(token);
    
    if (onboarding.status !== 'PENDING') {
      throw new ValidationError('Onboarding already submitted');
    }

    // Attempt automated doc verification
    let docVerificationScore: any = { status: 'PENDING', score: 0 };
    
    if (data.govDocUrls && data.govDocUrls.length > 0) {
      try {
        const imageUrl = data.govDocUrls[0];
        
        const worker = await Tesseract.createWorker('eng');
        const ret = await worker.recognize(imageUrl);
        const text = ret.data.text;
        await worker.terminate();

        // Extract MRZ lines
        const mrzLines = text.split('\n').filter(l => l.includes('<<')).slice(-2);
        if (mrzLines.length > 0) {
          const mrzText = mrzLines.join('\n');
          const mrzParse = parse(mrzText);
          if (mrzParse.valid) {
            docVerificationScore = { status: 'AUTO_VERIFIED', score: 100, details: mrzParse };
          } else {
            docVerificationScore = { status: 'REQUIRES_MANUAL_REVIEW', score: 50, details: mrzParse };
          }
        } else {
          docVerificationScore = { status: 'REQUIRES_MANUAL_REVIEW', score: 0, reason: 'MRZ not found' };
        }
      } catch (error) {
        docVerificationScore = { status: 'ERROR', message: 'Failed to process document automatically' };
      }
    }

    let nextStatus = docVerificationScore.status === 'AUTO_VERIFIED' ? OnboardingStatus.AUTO_VERIFIED : OnboardingStatus.SUBMITTED;

    const encryptedGovDocUrls = data.govDocUrls ? data.govDocUrls.map((url: string) => EncryptionService.encrypt(url)) : [];
    const encryptedSignatureUrl = data.signatureUrl ? EncryptionService.encrypt(data.signatureUrl) : null;

    return await this.prisma.companyOnboarding.update({
      where: { token },
      data: {
        companyName: data.companyName,
        size: data.size,
        division: data.division,
        location: data.location,
        adminName: data.adminName,
        adminEmail: data.adminEmail,
        logoUrl: data.logoUrl,
        govDocUrls: encryptedGovDocUrls,
        faceScanData: data.faceScanData,
        signatureUrl: encryptedSignatureUrl,
        docVerificationScore,
        status: nextStatus
      }
    });
  }

  async approveSubmission(id: string) {
    const onboarding = await this.prisma.companyOnboarding.findUnique({
      where: { id }
    });

    if (!onboarding || (onboarding.status !== 'SUBMITTED' && onboarding.status !== 'AUTO_VERIFIED')) {
      throw new ValidationError('Invalid onboarding status for approval');
    }

    // 1. Generate MoU PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { width, height } = page.getSize();

    page.drawText('Memorandum of Understanding', { x: 50, y: height - 50, size: 20, font });
    page.drawText(`Company: ${onboarding.companyName}`, { x: 50, y: height - 100, size: 12, font });
    page.drawText(`Representative: ${onboarding.adminName}`, { x: 50, y: height - 130, size: 12, font });
    page.drawText(`Location: ${onboarding.location}`, { x: 50, y: height - 160, size: 12, font });
    page.drawText(`Date: ${new Date().toLocaleDateString()}`, { x: 50, y: height - 190, size: 12, font });

    const sigUrl = onboarding.signatureUrl;
    if (sigUrl && sigUrl.startsWith('data:image/png;base64,')) {
      const signatureBytes = Buffer.from(sigUrl.split(',')[1] as string, 'base64');
      const signatureImage = await pdfDoc.embedPng(signatureBytes);
      page.drawImage(signatureImage, { x: 50, y: height - 300, width: 200, height: 50 });
      page.drawText('Signed (Digital Signature)', { x: 50, y: height - 320, size: 10, font });
    }

    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
    const mouUrl = `data:application/pdf;base64,${pdfBase64}`;

    // 2. Transaction
    return await this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: onboarding.companyName || 'Unknown',
          slug: onboarding.companyName?.toLowerCase().replace(/[\s_]+/g, '-') + '-' + uuidv4().substring(0, 8),
          status: 'ACTIVE',
          ekycStatus: 'VERIFIED_MANUAL',
          location: onboarding.location,
          industry: onboarding.division,
          logoUrl: onboarding.logoUrl,
        }
      });

      const user = await tx.user.create({
        data: {
          email: onboarding.adminEmail || `admin-${uuidv4()}@test.com`,
          firstName: onboarding.adminName?.split(' ')[0] || 'Admin',
          lastName: onboarding.adminName?.split(' ').slice(1).join(' ') || '',
          passwordHash: 'not-set',
          role: 'COMPANY_OWNER'
        }
      });

      await tx.companyMember.create({
        data: {
          companyId: company.id,
          userId: user.id,
          role: 'COMPANY_OWNER',
          invitedBy: onboarding.superAdminId
        }
      });

      await tx.companyOnboarding.update({
        where: { id },
        data: {
          status: 'APPROVED',
          mouUrl
        }
      });

      return { company, user, mouUrl };
    });
  }

  async getAllOnboardings() {
    const onboardings = await this.prisma.companyOnboarding.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return onboardings.map(o => ({
      ...o,
      signatureUrl: o.signatureUrl ? EncryptionService.decrypt(o.signatureUrl) : null,
      govDocUrls: Array.isArray(o.govDocUrls) ? o.govDocUrls.map(url => EncryptionService.decrypt(url as string)) : []
    }));
  }
}
