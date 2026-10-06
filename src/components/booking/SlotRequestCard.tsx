import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SlotRequest } from '../../types';
import { testingCentres } from '../../data/natisServices';
import {
  formatDateTime,
  NATIS_FEES,
  SLOT_SERVICE_LABELS,
  timeLeft } from
'../../utils/natis';
import { formatDate } from '../../utils/formatters';
import { generateReceiptNumber } from '../../utils/payments';
import { BellRingIcon, HourglassIcon, MapPinIcon } from 'lucide-react';
import { toast } from 'sonner';

interface SlotRequestCardProps {
  request: SlotRequest;
}

/** Shows a queued slot request, or an allocated offer with its 24-hour clock. */
export function SlotRequestCard({ request }: SlotRequestCardProps) {
  const { dispatch } = useAppStore();
  const [, setTick] = useState(0);
  const [confirm, setConfirm] = useState<'decline' | 'withdraw' | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const offer = request.offer;
  const remaining = offer ? timeLeft(offer.expiresAt) : null;

  useEffect(() => {
    if (request.status !== 'offered') return;
    const id = window.setInterval(() => setTick((t) => t + 1), 30000);
    return () => window.clearInterval(id);
  }, [request.status]);

  useEffect(() => {
    if (request.status === 'offered' && remaining?.expired) {
      dispatch({ type: 'EXPIRE_SLOT', payload: request.id });
    }
  }, [request.status, request.id, remaining?.expired, dispatch]);

  const checkAllocation = () => {
    setIsChecking(true);
    setTimeout(() => {
      const centre =
      testingCentres.find((c) => c.area === request.preferredArea) ??
      testingCentres[0];
      const date = new Date();
      date.setDate(date.getDate() + 7);
      date.setHours(8, 0, 0, 0);
      dispatch({
        type: 'OFFER_SLOT',
        payload: {
          id: request.id,
          offer: {
            centreId: centre.id,
            centre: centre.name,
            appointmentAt: date.toISOString(),
            expiresAt: new Date(Date.now() + 24 * 3600000).toISOString()
          }
        }
      });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `notif_${Date.now()}`,
          title: 'Slot offered — respond within 24 hours',
          message: `${centre.name} on ${formatDateTime(date.toISOString())}. Accept or decline before the offer lapses.`,
          type: 'deadline',
          read: false,
          createdAt: new Date().toISOString(),
          linkTab: 'licence-services'
        }
      });
      setIsChecking(false);
      toast.success('A slot has been allocated');
    }, 1200);
  };

  const accept = () => {
    if (!offer) return;
    const receiptNumber = generateReceiptNumber('SLT');
    dispatch({
      type: 'ACCEPT_SLOT',
      payload: {
        id: request.id,
        booking: {
          id: `bk_${Date.now()}`,
          service: request.service === 'prdp' ? 'prdp' : 'licence-renewal',
          centreId: offer.centreId,
          centre: offer.centre,
          appointmentAt: offer.appointmentAt,
          status: 'confirmed',
          fee: NATIS_FEES.onlineBookingFee,
          receiptNumber,
          createdAt: new Date().toISOString(),
          rescheduleCount: 0,
          source: 'slot'
        }
      }
    });
    toast.success('Slot accepted and booked');
  };

  if (request.status === 'offered' && offer && remaining) {
    const urgent = remaining.hours < 6;
    return (
      <div
        className={`rounded-2xl border p-5 ${
        urgent ?
        'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50' :
        'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50'}`
        }>
        
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <BellRingIcon
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${urgent ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} />
            
            <div className="min-w-0">
              <p
                className={`font-bold ${urgent ? 'text-red-900 dark:text-red-200' : 'text-amber-900 dark:text-amber-200'}`}>
                
                Slot offered: {SLOT_SERVICE_LABELS[request.service]}
              </p>
              <p
                className={`text-sm mt-0.5 ${urgent ? 'text-red-700 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'}`}>
                
                <MapPinIcon className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
                {offer.centre} · {formatDateTime(offer.appointmentAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right">
              <p
                className={`text-2xl font-bold tabular-nums leading-none ${urgent ? 'text-red-700 dark:text-red-300' : 'text-amber-800 dark:text-amber-200'}`}>
                
                {remaining.hours}h {String(remaining.minutes).padStart(2, '0')}m
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                left to respond
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setConfirm('decline')}>
                Decline
              </Button>
              <Button size="sm" onClick={accept}>
                Accept
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-4 h-1.5 rounded-full bg-gray-900/10 dark:bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full ${urgent ? 'bg-red-500' : 'bg-amber-500'}`}
            style={{ width: `${remaining.fraction * 100}%` }} />
          
        </div>

        <ConfirmDialog
          isOpen={confirm === 'decline'}
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            dispatch({ type: 'DECLINE_SLOT', payload: request.id });
            toast.info('Slot declined');
          }}
          title="Decline this slot?"
          message="The slot goes to the next person in the queue. You will need to register again to get another offer."
          confirmLabel="Decline slot"
          cancelLabel="Keep offer" />
        
      </div>);

  }

  // Waiting in the queue
  const daysWaiting = Math.floor(
    (Date.now() - new Date(request.registeredAt).getTime()) / 86400000
  );
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center flex-shrink-0">
          <HourglassIcon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 dark:text-white">
            {SLOT_SERVICE_LABELS[request.service]}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            In queue near {request.preferredArea} · registered{' '}
            {formatDate(request.registeredAt)} · allocation due within{' '}
            {Math.max(0, 30 - daysWaiting)} days
          </p>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={() => setConfirm('withdraw')}>
          Withdraw
        </Button>
        <Button variant="secondary" size="sm" isLoading={isChecking} onClick={checkAllocation}>
          Check for allocation
        </Button>
      </div>

      <ConfirmDialog
        isOpen={confirm === 'withdraw'}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          dispatch({ type: 'WITHDRAW_SLOT_REQUEST', payload: request.id });
          toast.info('Removed from the queue');
        }}
        title="Leave the queue?"
        message="You will lose your place. You can register again at any time."
        confirmLabel="Withdraw" />
      
    </div>);

}