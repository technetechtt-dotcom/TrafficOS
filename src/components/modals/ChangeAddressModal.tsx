import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAppStore } from '../../stores/useAppStore';
import { provinces } from '../../data/natisServices';
import { Address } from '../../types';
import { InfoIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ChangeAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const empty: Address = {
  street: '',
  suburb: '',
  city: '',
  province: 'Gauteng',
  postalCode: ''
};

/**
 * Change of particulars (NCP). Keeping this current matters: AARTO notices
 * are served at the address on eNaTIS, and a notice sent to an outdated
 * address is a recognised ground for representation.
 */
export function ChangeAddressModal({ isOpen, onClose }: ChangeAddressModalProps) {
  const { state, dispatch } = useAppStore();
  const [form, setForm] = useState<Address>(state.address ?? empty);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setForm(state.address ?? empty);
  }, [isOpen, state.address]);

  const postalError =
  form.postalCode.length > 0 && !/^\d{4}$/.test(form.postalCode) ?
  'Postal codes are four digits' :
  undefined;

  const update = (key: keyof Address) => (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
  setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (postalError) return;
    setIsSaving(true);
    setTimeout(() => {
      dispatch({
        type: 'UPDATE_ADDRESS',
        payload: {
          ...form,
          updatedAt: new Date().toISOString(),
          natisStatus: 'pending'
        }
      });
      setIsSaving(false);
      onClose();
      toast.success('Address submitted to eNaTIS');
      // eNaTIS confirms the NCP shortly after submission
      setTimeout(() => {
        dispatch({
          type: 'UPDATE_ADDRESS',
          payload: {
            ...form,
            updatedAt: new Date().toISOString(),
            natisStatus: 'synced'
          }
        });
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: `notif_${Date.now()}`,
            title: 'Address Updated on eNaTIS',
            message:
            'Your change of particulars has been recorded. Future notices, discs and cards will go to your new address.',
            type: 'licence',
            read: false,
            createdAt: new Date().toISOString(),
            linkTab: 'profile'
          }
        });
      }, 4000);
    }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change of Address" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3.5">
          <InfoIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
            This files an NCP (notice of change of particulars) on eNaTIS.
            Infringement notices, licence discs and cards are all sent to this
            address, so keep it current.
          </p>
        </div>

        <Input
          label="Street address"
          value={form.street}
          onChange={update('street')}
          placeholder="14 Jan Smuts Avenue"
          required />
        
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Suburb"
            value={form.suburb}
            onChange={update('suburb')}
            required />
          
          <Input
            label="City"
            value={form.city}
            onChange={update('city')}
            required />
          
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="province"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              
              Province
            </label>
            <select
              id="province"
              value={form.province}
              onChange={update('province')}
              className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white min-h-[44px]">
              
              {provinces.map((p) =>
              <option key={p}>{p}</option>
              )}
            </select>
          </div>
          <Input
            label="Postal code"
            value={form.postalCode}
            onChange={update('postalCode')}
            maxLength={4}
            inputMode="numeric"
            error={postalError}
            required />
          
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" fullWidth isLoading={isSaving}>
            Submit to eNaTIS
          </Button>
        </div>
      </form>
    </Modal>);

}