import React, { useRef, useState } from 'react';
import { firmwareInstaller } from '@/utils/firmwareInstaller';

interface FirmwareInstallModalProps {
  open: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  portRef?: React.MutableRefObject<any>; // Accept existing port reference
}

export default function FirmwareInstallModal({ open, onClose, portRef: externalPortRef }: FirmwareInstallModalProps) {
  const [isInstalling, setIsInstalling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fallbackPortRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Use external port ref if provided, otherwise use fallback
  const portRef = externalPortRef || fallbackPortRef;

  if (!open) return null;

  const handleInstall = async () => {
    if (isInstalling) return;
    setIsInstalling(true);
    setError(null);
    setSuccess(null);
    setProgress(0);
    setStatus('Preparing installation...');
    
    // Create new abort controller for this installation
    abortControllerRef.current = new AbortController();
    
    try {
      const result = await firmwareInstaller(portRef, (p: number, s: string) => {
        setProgress(p);
        setStatus(s);
      }, abortControllerRef.current.signal);
      setSuccess(result.message);
      setStatus('Installation completed successfully!');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.message === 'Installation cancelled by user') {
        setError('Installation cancelled');
        setStatus('Installation cancelled by user');
      } else {
        setError(err?.message || 'Firmware installation failed');
        setStatus('Installation failed');
      }
    } finally {
      setIsInstalling(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleClose = () => {
    if (isInstalling) return;
    onClose();
    setProgress(0);
    setStatus('');
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[92vw] max-w-[560px] p-6 relative">
        <button aria-label="Close" onClick={handleClose} disabled={isInstalling} className={`absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center ${isInstalling ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="mb-4">
          <h3 className="text-xl font-extrabold text-[#0F172A]">Install Firmware</h3>
          <p className="text-sm text-[#475569] mt-1">MicroPython wasn’t detected on your device. Install firmware via USB to continue.</p>
        </div>

        {status && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#374151]">Status</span>
              {progress > 0 && (
                <span className="text-sm font-medium text-[#00AEEF]">{Math.round(progress)}%</span>
              )}
            </div>
            <div className="w-full bg-[#F3F4F6] rounded-full h-2">
              <div className="bg-[#00AEEF] h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm text-[#6B7280] mt-2">{status}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">{success}</div>
        )}

        <div className="flex gap-3">
          {!isInstalling ? (
            <>
              <button onClick={handleInstall} className="flex-1 px-4 py-3 rounded-xl font-medium text-sm bg-[#00AEEF] text-white hover:bg-[#0098D4]">
                Install Firmware
              </button>
              <button onClick={handleClose} className="px-4 py-3 rounded-xl font-medium text-sm border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]">
                Close
              </button>
            </>
          ) : (
            <>
              <button disabled className="flex-1 px-4 py-3 rounded-xl font-medium text-sm bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed">
                Installing…
              </button>
              <button onClick={handleCancel} className="px-4 py-3 rounded-xl font-medium text-sm bg-[#FF4D4F] text-white hover:bg-[#FF3030]">
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


