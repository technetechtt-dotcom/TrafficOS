import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAppStore } from '../../stores/useAppStore';
import { testingCentres } from '../../data/natisServices';
import { SLOT_SERVICE_LABELS } from '../../utils/natis';
import { SlotService } from '../../types';
import { CheckIcon } from 'lucide-react';
import { toast } from 'sonner';

interface RequestSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RULES = [
'Registering is not a booking. NaTIS allocates a slot within 30 days.',
'You will get an SMS, email and app alert with the centre, date and time.',
'You must accept or decline within 24 hours, or the offer lapses.',
'If you accept and do not attend, you cannot register for a slot again.'];


export function RequestSlotModal({ isOpen, onClose }: RequestSlotModalProps) {
  const { state, dispatch } = useAppStore();
  const [service, setService] = useState<SlotService>('licence-renewal');
  const [centreId, setCentreId] = useState(testingCentres[0].id);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setService('licence-renewal');
      setCentreId(testingCentres[0].id);
      setAgreed(false);
    }
  }, [isOpen]);

  const alreadyQueued = state.slotRequests.some(
    (s) =>
    s.service === service && (s.status === 'waiting' || s.status === 'offered')
  );

  const handleSubmit = () => {
    const centre = testingCentres.find((c) => c.id === centreId) ?? testingCentres[0];
    const now = new Date().toISOString();
    dispatch({
      type: 'ADD_SLOT_REQUEST',
      payload: {
        id: `slot_${Date.now()}`,
        service,
        preferredArea: centre.area,
        status: 'waiting',
        registeredAt: now
      }
    });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `notif_${Date.now()}`,
        title: 'Registered for a slot',
        message: `You are in the queue for ${SLOT_SERVICE_LABELS[service].toLowerCase()} near ${centre.area}. This is not a booking yet.`,
        type: 'licence',
        read: false,
        createdAt: now,
        linkTab: 'licence-services'
      }
    });
    toast.success('You are in the queue');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request a slot" maxWidth="md">
      <div className="space-y-5">
        <fieldset>
          <legend className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Service
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(SLOT_SERVICE_LABELS) as SlotService[]).map((s) => {
              const isSelected = s === service;
              return (
                <button
                  type="button"
                  key={s}
                  aria-pressed={isSelected}
                  onClick={() => setService(s)}
                  className={`p-3 rounded-xl border text-sm font-medium text-left transition-colors ${
                  isSelected ?
                  'border-blue-600 bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-200' :
                  'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'}`
                  }>
                  
                  {SLOT_SERVICE_LABELS[s]}
                </button>);

            })}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="slot-centre"
            className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            
            Preferred centre
          </label>
          <select
            id="slot-centre"
            value={centreId}
            onChange={(e) => setCentreId(e.target.value)}
            className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white min-h-[44px]">
            
            {testingCentres.map((c) =>
            <option key={c.id} value={c.id}>
                {c.name} — {c.area}
              </option>
            )}
          </select>
        </div>

        <ol className="space-y-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          {RULES.map((rule, i) =>
          <li key={rule} className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold text-gray-900 dark:text-white">{i + 1}.</span>
              <span>{rule}</span>
            </li>
          )}
        </ol>

        <button
          type="button"
          onClick={() => setAgreed(!agreed)}
          aria-pressed={agreed}
          className="w-full flex items-start gap-3 text-left">
          
          <span
            className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
            agreed ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600'}`
            }>
            
            {agreed && <CheckIcon className="w-3.5 h-3.5 text-white" />}
          </span>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            I understand I must respond within 24 hours and that a no-show bars
            me from requesting a slot again.
          </span>
        </button>

        {alreadyQueued &&
        <p className="text-sm text-amber-700 dark:text-amber-400">
            You already have an open request for this service.
          </p>
        }

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button fullWidth disabled={!agreed || alreadyQueued} onClick={handleSubmit}>
            Register for a slot
          </Button>
        </div>
      </div>
    </Modal>);

}