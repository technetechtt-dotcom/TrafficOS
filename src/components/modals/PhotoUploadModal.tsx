import React, { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAppStore } from '../../stores/useAppStore';
import {
  CameraIcon,
  UploadCloudIcon,
  LoaderIcon,
  CheckCircleIcon } from
'lucide-react';
import { toast } from 'sonner';
interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function PhotoUploadModal({ isOpen, onClose }: PhotoUploadModalProps) {
  const { state, dispatch } = useAppStore();
  const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    offenceType: 'Speeding',
    amount: '1500',
    issuedBy: 'JMPD',
    issuedDate: new Date().toISOString().split('T')[0],
    location: 'M1 South, Johannesburg',
    referenceNumber: `JMPD-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`,
    licensePlate: state.vehicles[0]?.licensePlate || 'GP 123-456'
  });
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setStep('processing');
      // Simulate OCR processing
      setTimeout(() => {
        setStep('review');
        toast.success('Fine details extracted successfully');
      }, 2500);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFine = {
      id: `fine_${Date.now()}`,
      vehicleId:
      state.vehicles.find((v) => v.licensePlate === formData.licensePlate)?.
      id || 'unknown',
      licensePlate: formData.licensePlate,
      offenceType: formData.offenceType,
      offenceDescription: 'Extracted from uploaded notice',
      amount: parseInt(formData.amount),
      status: 'pending' as const,
      issuedBy: formData.issuedBy,
      issuedDate: new Date(formData.issuedDate).toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      location: formData.location,
      referenceNumber: formData.referenceNumber,
      uploadedAt: new Date().toISOString()
    };
    dispatch({
      type: 'ADD_FINE',
      payload: newFine
    });
    toast.success('Fine added successfully');
    // Reset and close
    setStep('upload');
    onClose();
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setStep('upload');
        onClose();
      }}
      title="Upload Infringement Notice"
      maxWidth="md">
      
      {step === 'upload' &&
      <div className="py-6">
          <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}>
          
            <UploadCloudIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Tap to upload or take a photo
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Make sure the reference number and amount are clearly visible.
            </p>
            <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange} />
          
          </div>
          <div className="mt-6">
            <Button
            variant="primary"
            fullWidth
            leftIcon={<CameraIcon className="w-5 h-5" />}
            onClick={() => fileInputRef.current?.click()}>
            
              Open Camera
            </Button>
          </div>
        </div>
      }

      {step === 'processing' &&
      <div className="py-16 flex flex-col items-center justify-center text-center">
          <LoaderIcon className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Extracting Details...
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Our AI is reading the infringement notice.
          </p>
        </div>
      }

      {step === 'review' &&
      <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl flex items-center text-emerald-800 dark:text-emerald-300 text-sm mb-4">
            <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
            Details extracted successfully. Please verify before saving.
          </div>

          <Input
          label="Reference Number"
          value={formData.referenceNumber}
          onChange={(e) =>
          setFormData({
            ...formData,
            referenceNumber: e.target.value
          })
          }
          required />
        
          <div className="grid grid-cols-2 gap-4">
            <Input
            label="Amount (R)"
            type="number"
            value={formData.amount}
            onChange={(e) =>
            setFormData({
              ...formData,
              amount: e.target.value
            })
            }
            required />
          
            <Input
            label="License Plate"
            value={formData.licensePlate}
            onChange={(e) =>
            setFormData({
              ...formData,
              licensePlate: e.target.value
            })
            }
            required />
          
          </div>
          <Input
          label="Offence Type"
          value={formData.offenceType}
          onChange={(e) =>
          setFormData({
            ...formData,
            offenceType: e.target.value
          })
          }
          required />
        
          <Input
          label="Location"
          value={formData.location}
          onChange={(e) =>
          setFormData({
            ...formData,
            location: e.target.value
          })
          }
          required />
        
          <div className="flex gap-3 pt-4">
            <Button
            type="button"
            variant="ghost"
            onClick={() => setStep('upload')}
            className="flex-1">
            
              Retake
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save Fine
            </Button>
          </div>
        </form>
      }
    </Modal>);

}