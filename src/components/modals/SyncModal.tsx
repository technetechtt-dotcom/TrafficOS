import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAppStore } from '../../stores/useAppStore';
import { LoaderIcon, CheckCircleIcon, ShieldIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Fine } from '../../types';
interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function SyncModal({ isOpen, onClose }: SyncModalProps) {
  const { state, dispatch } = useAppStore();
  const [step, setStep] = useState(0); // 0: init, 1: auth, 2: fetch, 3: process, 4: complete
  const [newFines, setNewFines] = useState<Fine[]>([]);
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const timer1 = setTimeout(() => setStep(2), 1500);
      const timer2 = setTimeout(() => setStep(3), 3000);
      const timer3 = setTimeout(() => {
        // Generate mock new fines
        const mockNewFines: Fine[] = [
        {
          id: `fine_sync_${Date.now()}_1`,
          vehicleId: state.vehicles[0]?.id || 'unknown',
          licensePlate: state.vehicles[0]?.licensePlate || 'CA 123-456',
          offenceType: 'Illegal Parking',
          offenceDescription: 'Parking in a loading zone',
          amount: 500,
          status: 'pending',
          issuedBy: 'Cape Town Metro Police',
          issuedDate: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          dueDate: new Date(
            Date.now() + 25 * 24 * 60 * 60 * 1000
          ).toISOString(),
          location: 'Long Street, CBD',
          referenceNumber: `CTMP-${new Date().getFullYear()}-SYNC1`
        }];

        setNewFines(mockNewFines);
        setStep(4);
      }, 4500);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setStep(0);
      setNewFines([]);
    }
  }, [isOpen]);
  const handleImport = () => {
    dispatch({
      type: 'SYNC_FINES',
      payload: newFines
    });
    toast.success(`Successfully imported ${newFines.length} fines from AARTO`);
    onClose();
  };
  const steps = [
  {
    id: 1,
    label: 'Authenticating with eNaTIS...'
  },
  {
    id: 2,
    label: 'Fetching AARTO records...'
  },
  {
    id: 3,
    label: 'Processing fine data...'
  }];

  return (
    <Modal
      isOpen={isOpen}
      onClose={step === 4 ? onClose : () => {}}
      title="Official Data Sync"
      maxWidth="sm">
      
      <div className="py-6">
        {step < 4 ?
        <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-gray-100 dark:border-gray-800 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              <ShieldIcon className="absolute inset-0 m-auto w-8 h-8 text-blue-600" />
            </div>

            <div className="w-full max-w-xs space-y-3">
              {steps.map((s) =>
            <div
              key={s.id}
              className={`flex items-center text-sm ${step >= s.id ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400 dark:text-gray-600'}`}>
              
                  {step > s.id ?
              <CheckCircleIcon className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" /> :
              step === s.id ?
              <LoaderIcon className="w-5 h-5 text-blue-500 animate-spin mr-3 flex-shrink-0" /> :

              <div className="w-5 h-5 rounded-full border-2 border-current mr-3 flex-shrink-0" />
              }
                  {s.label}
                </div>
            )}
            </div>
          </div> :

        <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Sync Complete
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Found{' '}
              <span className="font-bold text-gray-900 dark:text-white">
                {newFines.length}
              </span>{' '}
              new fines linked to your ID number.
            </p>

            <div className="w-full bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6 text-left">
              {newFines.map((fine) =>
            <div
              key={fine.id}
              className="flex justify-between items-center">
              
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {fine.offenceType}
                    </div>
                    <div className="text-xs text-gray-500">
                      {fine.licensePlate}
                    </div>
                  </div>
                  <div className="font-bold text-sm">R{fine.amount}</div>
                </div>
            )}
            </div>

            <Button variant="primary" fullWidth onClick={handleImport}>
              Import Fines
            </Button>
          </div>
        }
      </div>
    </Modal>);

}