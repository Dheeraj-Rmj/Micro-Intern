'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import * as faceapi from 'face-api.js';
import SignatureCanvas from 'react-signature-canvas';
import { Camera, UploadCloud, CheckCircle2, ChevronRight, ShieldCheck, Building2, User } from 'lucide-react';
import { Toast } from '@/components/microint/components/common/Toast';

export default function OnboardingPage() {
  const params = useParams();
  const token = params?.['token'] as string;
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    size: '1-10',
    division: '',
    location: '',
    adminName: '',
    adminEmail: '',
  });

  // Assets
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [govDocUrls, setGovDocUrls] = useState<string[]>([]);
  const [faceScanData, setFaceScanData] = useState<any>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);

  const sigCanvas = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Validate Token
    apiClient.get(`/onboarding/${token}`)
      .then(res => {
        if (res.data.data.status !== 'PENDING') {
          setError('This onboarding link is no longer valid or has already been submitted.');
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Invalid onboarding link.');
        setLoading(false);
      });

    // Load FaceAPI models
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      } catch (e) {
        console.error('Failed to load face-api models', e);
      }
    };
    loadModels();
  }, [token]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  // 1. Image Resize for Logo & Gov Doc (Strict size constraints)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'govDoc') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024 || file.size < 50 * 1024) {
      alert('File must be between 50KB and 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 2048;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

        if (type === 'logo') setLogoUrl(dataUrl);
        if (type === 'govDoc') setGovDocUrls([dataUrl]);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // 2. Face API Liveness Check
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (e) {
      alert('Camera access denied or unavailable.');
    }
  };

  const captureFace = async () => {
    if (videoRef.current) {
      const detection = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks();

      if (detection) {
        setFaceScanData({
          confidence: detection.detection.score,
          landmarks: detection.landmarks.positions.length,
          timestamp: new Date().toISOString()
        });
        // Stop camera
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(t => t.stop());
        alert('Face verified successfully!');
      } else {
        alert('No face detected. Please ensure you are in a well-lit area and looking directly at the camera.');
      }
    }
  };

  // 3. Final Submit
  const handleSubmit = async () => {
    if (sigCanvas.current) {
      const sig = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      setSignatureUrl(sig);
      setSubmitting(true);
      try {
        await apiClient.post(`/onboarding/${token}/submit`, {
          ...formData,
          logoUrl,
          govDocUrls,
          faceScanData,
          signatureUrl: sig
        });
        setStep(5); // Success step
      } catch (e: any) {
        alert('Submission failed: ' + (e.response?.data?.error || e.message));
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDFCF9]">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-[#FDFCF9] text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-black font-sans py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <Toast />
      <div className="w-full max-w-3xl mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Company eKYC Onboarding</h1>
          <p className="text-sm text-black/60 font-mono uppercase mt-1">Step {step} of 4</p>
        </div>
        <ShieldCheck className="w-12 h-12 text-emerald-600 opacity-20" />
      </div>

      <div className="w-full max-w-3xl bg-white rounded-[32px] shadow-sm border border-black/5 p-8">
        
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Building2 className="w-5 h-5"/> Basic Information</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Company Name</label>
                <input type="text" className="w-full p-3 bg-black/5 rounded-xl outline-none" 
                  value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Company Size</label>
                <select className="w-full p-3 bg-black/5 rounded-xl outline-none" 
                  value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})}>
                  <option>1-10</option>
                  <option>11-50</option>
                  <option>51-200</option>
                  <option>201-1000</option>
                  <option>1000+</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Industry / Division</label>
                <input type="text" className="w-full p-3 bg-black/5 rounded-xl outline-none" 
                  value={formData.division} onChange={e => setFormData({...formData, division: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Location</label>
                <input type="text" className="w-full p-3 bg-black/5 rounded-xl outline-none" 
                  value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
            </div>

            <h2 className="text-xl font-semibold flex items-center gap-2 pt-6 border-t border-black/5"><User className="w-5 h-5"/> Admin Details</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Full Name</label>
                <input type="text" className="w-full p-3 bg-black/5 rounded-xl outline-none" 
                  value={formData.adminName} onChange={e => setFormData({...formData, adminName: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Work Email</label>
                <input type="email" className="w-full p-3 bg-black/5 rounded-xl outline-none" 
                  value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={handleNext} className="px-6 py-3 bg-[#111111] text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:scale-105 transition-transform">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-semibold">Branding & Logo</h2>
            <p className="text-sm text-black/60">Upload your company logo (JPG/PNG).</p>
            
            <div className="border-2 border-dashed border-black/10 rounded-2xl p-12 flex flex-col items-center justify-center relative hover:bg-black/5 transition-colors">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="max-h-32 object-contain" />
              ) : (
                <>
                  <UploadCloud className="w-10 h-10 text-black/40 mb-3" />
                  <span className="text-sm font-medium">Click or drag logo here</span>
                </>
              )}
              <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => handleImageUpload(e, 'logo')} />
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={handleBack} className="px-6 py-3 bg-black/5 rounded-xl text-sm font-semibold">Back</button>
              <button onClick={handleNext} disabled={!logoUrl} className="px-6 py-3 bg-[#111111] text-white rounded-xl text-sm font-semibold disabled:opacity-50">Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-semibold">Identity Verification (eKYC)</h2>
            <p className="text-sm text-black/60">Please upload a valid Government ID and perform a 3D Face Liveness check.</p>
            
            <div className="space-y-4">
              <h3 className="font-medium text-sm uppercase tracking-wider">1. Upload Government ID</h3>
              <div className="border-2 border-dashed border-black/10 rounded-2xl p-8 flex flex-col items-center justify-center relative hover:bg-black/5">
                {govDocUrls.length > 0 ? (
                  <img src={govDocUrls[0]} alt="Gov ID" className="max-h-32 object-contain rounded-lg" />
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-black/40 mb-2" />
                    <span className="text-xs font-medium text-black/60">Upload Passport or Driver&apos;s License (Max 5MB)</span>
                  </>
                )}
                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => handleImageUpload(e, 'govDoc')} />
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-black/5">
              <h3 className="font-medium text-sm uppercase tracking-wider">2. 3D Face Liveness Scan</h3>
              {faceScanData ? (
                <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="font-semibold text-sm">Face Liveness Verified Successfully</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <video ref={videoRef} autoPlay muted className="w-full max-w-sm rounded-2xl bg-black/5 h-[280px] object-cover" />
                  <div className="flex gap-3">
                    <button onClick={startCamera} className="px-4 py-2 bg-black/5 rounded-lg text-sm font-semibold flex items-center gap-2">
                      <Camera className="w-4 h-4" /> Start Camera
                    </button>
                    <button onClick={captureFace} className="px-4 py-2 bg-[#111111] text-white rounded-lg text-sm font-semibold">
                      Verify Liveness
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={handleBack} className="px-6 py-3 bg-black/5 rounded-xl text-sm font-semibold">Back</button>
              <button onClick={handleNext} disabled={!govDocUrls.length || !faceScanData} className="px-6 py-3 bg-[#111111] text-white rounded-xl text-sm font-semibold disabled:opacity-50">Next</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-semibold">Digital Signature</h2>
            <p className="text-sm text-black/60">Draw your signature below to authorize the Memorandum of Understanding (MoU).</p>
            
            <div className="border border-black/10 rounded-2xl overflow-hidden bg-white shadow-inner">
              <SignatureCanvas 
                ref={sigCanvas}
                penColor="black"
                canvasProps={{className: 'w-full h-[200px]'}} 
              />
            </div>
            <div className="flex justify-end">
              <button onClick={() => sigCanvas.current?.clear()} className="text-xs font-semibold text-black/50 hover:text-black">Clear Signature</button>
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={handleBack} className="px-6 py-3 bg-black/5 rounded-xl text-sm font-semibold">Back</button>
              <button onClick={handleSubmit} disabled={submitting} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2">
                {submitting ? 'Submitting...' : 'Complete eKYC & Submit'}
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="py-12 flex flex-col items-center text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-black mb-3">Onboarding Submitted</h2>
            <p className="text-black/60 max-w-md">
              Your company details and eKYC documents have been securely transmitted to the Super Admin for final verification. Once approved, you will receive an email with your signed MoU.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
