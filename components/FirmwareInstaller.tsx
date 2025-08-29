import React, { useState, useRef } from 'react';
import { firmwareInstaller } from '@/utils/firmwareInstaller';

interface FirmwareInstallerProps {
  className?: string;
}

export default function FirmwareInstaller({ className = '' }: FirmwareInstallerProps) {
  const [isInstalling, setIsInstalling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const portRef = useRef<any | null>(null);

  const handleInstall = async () => {
    if (isInstalling) return;

    setIsInstalling(true);
    setError(null);
    setSuccess(null);
    setProgress(0);
    setStatus('Preparing installation...');

    try {
      const result = await firmwareInstaller(portRef, (progressPercent: number, statusMessage: string) => {
        setProgress(progressPercent);
        setStatus(statusMessage);
      });

      setSuccess(result.message);
      setStatus('Installation completed successfully!');
    } catch (err: unknown) {
      setError((err as Error).message || 'Firmware installation failed');
      setStatus('Installation failed');
    } finally {
      setIsInstalling(false);
    }
  };

  const handleReset = () => {
    setProgress(0);
    setStatus('');
    setError(null);
    setSuccess(null);
  };

  return (
    <div className={`bg-white rounded-[24px] shadow-sm border border-[#EEF2F7] p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[20px] font-extrabold text-[#0F172A] mb-2">
            Firmware Installation
          </h3>
          <p className="text-[14px] text-[#6B7280]">
            Install the latest firmware to your Magicbit device via USB serial connection
          </p>
        </div>
        <div className="w-12 h-12 bg-[#F3F8FF] rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-[#00AEEF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>

      {/* Installation Status */}
      {status && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#374151]">Status</span>
            {progress > 0 && (
              <span className="text-sm font-medium text-[#00AEEF]">
                {Math.round(progress)}%
              </span>
            )}
          </div>
          <div className="w-full bg-[#F3F4F6] rounded-full h-2">
            <div 
              className="bg-[#00AEEF] h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-[#6B7280] mt-2">{status}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-green-800">{success}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleInstall}
          disabled={isInstalling}
          className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
            isInstalling
              ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
              : 'bg-[#00AEEF] text-white hover:bg-[#0098D4] active:bg-[#0082BA]'
          }`}
        >
          {isInstalling ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Installing...
            </div>
          ) : (
            'Install Firmware'
          )}
        </button>

        {(success || error) && (
          <button
            onClick={handleReset}
            className="px-4 py-3 rounded-xl font-medium text-sm border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] active:bg-[#F3F4F6] transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
        <h4 className="text-sm font-medium text-[#374151] mb-2">Instructions:</h4>
        <ol className="text-xs text-[#6B7280] space-y-1 list-decimal list-inside">
          <li>Connect your Magicbit device via USB cable</li>
          <li>Ensure the device is in bootloader mode or ready to receive firmware</li>
          <li>Click &quot;Install Firmware&quot; to begin the installation process</li>
          <li>Wait for the installation to complete - do not disconnect the device</li>
          <li>The device will automatically restart after installation</li>
        </ol>
      </div>

      {/* Warning */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div className="text-xs text-amber-800">
            <p className="font-medium">Warning:</p>
            <p>Do not disconnect your device during firmware installation. This may cause the device to become unresponsive and require manual recovery.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
