import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { SlotPicker, toAppointmentIso } from '../booking/SlotPicker';
import { testingCentres, TestingCentre } from '../../data/natisServices';
import { formatDateTime } from '../../utils/natis';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLabel: string;
  currentCentreId?: string;
  onConfirm: (centre: TestingCentre, appointmentAt: string) => void;
}

export function RescheduleModal({
  isOpen,
  onClose,
  currentLabel,
  currentCentreId,
  onConfirm
}: RescheduleModalProps) {
  const [slot, setSlot] = useState<{
    centreId: string;
    date: string | null;
    time: string | null;
  }>({ centreId: currentCentreId ?? testingCentres[0].id, date: null, time: null });

  useEffect(() => {
    if (isOpen) {
      setSlot({
        centreId: currentCentreId ?? testingCentres[0].id,
        date: null,
        time: null
      });
    }
  }, [isOpen, currentCentreId]);

  const centre =
  testingCentres.find((c) => c.id === slot.centreId) ?? testingCentres[0];
  const appointmentAt =
  slot.date && slot.time ? toAppointmentIso(slot.date, slot.time) : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reschedule" maxWidth="lg">
      <div className="space-y-5">
        <div className="text-sm bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Current appointment
          </p>
          <p className="font-medium text-gray-900 dark:text-white mt-0.5">
            {currentLabel}
          </p>
        </div>

        <SlotPicker
          centreId={slot.centreId}
          date={slot.date}
          time={slot.time}
          onChange={setSlot} />
        

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Rescheduling is free and keeps the fee you already paid.
        </p>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            fullWidth
            disabled={!appointmentAt}
            onClick={() => {
              if (!appointmentAt) return;
              onConfirm(centre, appointmentAt);
              onClose();
            }}>
            
            {appointmentAt ?
            `Move to ${formatDateTime(appointmentAt)}` :
            'Pick a date and time'}
          </Button>
        </div>
      </div>
    </Modal>);

}