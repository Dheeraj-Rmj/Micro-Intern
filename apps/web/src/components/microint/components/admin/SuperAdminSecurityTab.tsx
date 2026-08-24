import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { apiClient } from '@/lib/api/client';
import { Shield, Key, CheckCircle2, QrCode } from 'lucide-react';

export const SuperAdminSecurityTab: React.FC = () => {
  const { showToast } = useApp();
  const [setupStep, setSetupStep] = useState<'idle' | 'qr' | 'success'>('idle');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [mfaSecret, setMfaSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleInitializeMfa = async () => {
    setIsSettingUp(true);
    try {
      // Calls the real backend API route we just implemented
      const response = await apiClient.post('/auth/mfa/setup/totp');
      const { qrCodeUrl, secret } = response.data.data;
      setQrCodeUrl(qrCodeUrl);
      setMfaSecret(secret);
      setSetupStep('qr');
      showToast('MFA Initialized', 'Scan the QR code with your authenticator app.', 'info');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to initialize MFA setup', 'warning');
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleVerifyMfa = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      showToast('Invalid Code', 'Please enter a 6-digit code', 'warning');
      return;
    }

    setIsVerifying(true);
    try {
      await apiClient.post('/auth/mfa/verify/totp', { token: verificationCode });
      setSetupStep('success');
      showToast('MFA Enabled', 'Multi-Factor Authentication has been successfully enabled on your account.', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'Invalid verification code', 'warning');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="p-8 rounded-[36px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
        <div>
          <h3 className="text-xl font-serif text-black dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" />
            <span>MFA & Zero-Trust Security</span>
          </h3>
          <p className="text-xs text-black/50 dark:text-white/60 mt-0.5">
            Configure Multi-Factor Authentication (TOTP / Google Authenticator) for your Super Admin account
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        {setupStep === 'idle' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-semibold text-sm text-black dark:text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-500" />
                  Authenticator App (TOTP)
                </div>
                <p className="text-xs text-black/60 dark:text-white/70">
                  Use an app like Google Authenticator, Authy, or 1Password to generate 6-digit verification codes.
                </p>
              </div>
              <button
                onClick={handleInitializeMfa}
                disabled={isSettingUp}
                className="shrink-0 px-5 py-2.5 rounded-full bg-[#111111] dark:bg-white text-white dark:text-black font-semibold text-xs shadow-sm hover:opacity-90 transition-opacity"
              >
                {isSettingUp ? 'Initializing...' : 'Setup Authenticator'}
              </button>
            </div>
          </div>
        )}

        {setupStep === 'qr' && (
          <div className="p-6 rounded-3xl border border-black/10 dark:border-white/10 flex flex-col items-center text-center space-y-6">
            <div className="p-3 bg-white rounded-2xl inline-block shadow-sm">
              <img src={qrCodeUrl} alt="MFA QR Code" className="w-48 h-48" />
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-black dark:text-white">Scan this QR Code</h4>
              <p className="text-xs text-black/60 dark:text-white/60 max-w-sm mx-auto">
                Open your authenticator app and scan the QR code above. If you can&apos;t scan it, enter this setup key manually:
              </p>
              <div className="font-mono text-sm tracking-widest p-2 bg-black/5 dark:bg-white/5 rounded-lg text-black dark:text-white selection:bg-indigo-500/30">
                {mfaSecret}
              </div>
            </div>

            <div className="w-full max-w-xs space-y-3 pt-4 border-t border-black/5 dark:border-white/10">
              <label className="block text-xs font-medium text-black/80 dark:text-white/80 text-left">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 rounded-2xl text-center font-mono tracking-[0.5em] text-lg transition-all focus:outline-none border bg-transparent border-black/20 dark:border-white/20 text-black dark:text-white focus:border-indigo-500"
              />
              <button
                onClick={handleVerifyMfa}
                disabled={isVerifying || verificationCode.length !== 6}
                className="w-full py-3 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {isVerifying ? 'Verifying...' : 'Verify & Enable'}
              </button>
            </div>
          </div>
        )}

        {setupStep === 'success' && (
          <div className="p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col items-center text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            <div>
              <h4 className="text-lg font-semibold text-black dark:text-white mb-1">MFA is Active</h4>
              <p className="text-xs text-black/60 dark:text-white/60">
                Your account is now protected with Two-Factor Authentication. You will be required to enter a code from your authenticator app every time you sign in to the Operations portal.
              </p>
            </div>
            <button
              onClick={() => setSetupStep('idle')}
              className="mt-4 px-6 py-2 rounded-full border border-black/10 dark:border-white/10 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
