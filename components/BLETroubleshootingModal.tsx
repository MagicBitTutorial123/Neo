import React from 'react';

interface BLETroubleshootingModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToSerial: () => void;
}

export default function BLETroubleshootingModal({ open, onClose, onSwitchToSerial }: BLETroubleshootingModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Device Not Found</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Your Neo device is not showing up in Bluetooth mode. Here are some steps to try:
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Reset the Board</h3>
                <p className="text-sm text-gray-600">
                  Press the reset button on your Neo device
                  Wait a moment and try connecting again.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Update Firmware</h3>
                <p className="text-sm text-gray-600">
                  Connect your device via USB cable and update the firmware. This will ensure 
                  the Bluetooth functionality is working properly.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSwitchToSerial}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-sm bg-[#00AEEF] text-white hover:bg-[#0098D4] transition-colors"
          >
            Connect via USB
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl font-medium text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Try Again
          </button>
        </div>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-2">
            <div className="text-amber-600 text-sm">⚠️</div>
            <div className="text-xs text-amber-700">
              <strong>Tip:</strong> Make sure your device is powered on and within range. 
              Bluetooth devices need to be within 10 meters for reliable connection.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
