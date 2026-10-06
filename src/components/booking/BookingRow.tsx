import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { RescheduleModal } from '../modals/RescheduleModal';
import { ServiceBooking } from '../../types';
import { formatDateTime, SERVICE_LABELS } from '../../utils/natis';
import { downloadTextFile } from '../../utils/payments';
import { buildBookingText } from '../../utils/bookingDocuments';
import { CalendarIcon, DownloadIcon } from 'lucide-react';
import { toast } from 'sonner';

interface BookingRowProps {
  booking: ServiceBooking;
}

export function BookingRow({ booking }: BookingRowProps) {
  const { state, dispatch } = useAppStore();
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

  const daysAway = Math.ceil(
    (new Date(booking.appointmentAt).getTime() - Date.now()) / 86400000
  );
  const isUpcoming = booking.status === 'confirmed' && daysAway >= 0;
  const holder = state.user?.name ?? 'Applicant';

  return (
    <li className="p-4 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div
          className={`w-12 flex-shrink-0 rounded-xl text-center py-1.5 ${
          isUpcoming ?
          'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' :
          'bg-gray-100 dark:bg-gray-800 text-gray-400'}`
          }>
          
          <span className="block text-[10px] font-semibold uppercase">
            {new Date(booking.appointmentAt).toLocaleDateString('en-ZA', { month: 'short' })}
          </span>
          <span className="block text-lg font-bold leading-tight">
            {new Date(booking.appointmentAt).getDate()}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={`font-medium ${booking.status === 'cancelled' ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
              
              {SERVICE_LABELS[booking.service]}
              {booking.licenceCode && ` · ${booking.licenceCode}`}
            </p>
            {booking.status === 'cancelled' &&
            <Badge variant="neutral" size="sm">Cancelled</Badge>
            }
            {booking.source === 'slot' && booking.status !== 'cancelled' &&
            <Badge variant="info" size="sm">From slot queue</Badge>
            }
            {isUpcoming && daysAway <= 3 &&
            <Badge variant="warning" size="sm">
                {daysAway === 0 ? 'Today' : `In ${daysAway}d`}
              </Badge>
            }
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {booking.centre} · {formatDateTime(booking.appointmentAt)} · ref{' '}
            {booking.receiptNumber}
          </p>
        </div>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        {isUpcoming ?
        <>
            <Button variant="ghost" size="sm" onClick={() => setIsCancelOpen(true)}>
              Cancel
            </Button>
            <Button
            variant="secondary"
            size="sm"
            leftIcon={<CalendarIcon className="w-4 h-4" />}
            onClick={() => setIsRescheduleOpen(true)}>
            
              Reschedule
            </Button>
          </> :

        <Button
          variant="ghost"
          size="sm"
          leftIcon={<DownloadIcon className="w-4 h-4" />}
          onClick={() =>
          downloadTextFile(
            `${booking.status === 'cancelled' ? 'Cancellation' : 'Booking'}_${booking.receiptNumber}.txt`,
            buildBookingText(
              booking,
              holder,
              booking.status === 'cancelled' ? 'cancellation' : 'confirmation'
            )
          )
          }>
          
            {booking.status === 'cancelled' ? 'Cancellation record' : 'Confirmation'}
          </Button>
        }
      </div>

      <ConfirmDialog
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={() => {
          dispatch({ type: 'CANCEL_BOOKING', payload: booking.id });
          downloadTextFile(
            `Cancellation_${booking.receiptNumber}.txt`,
            buildBookingText(
              { ...booking, status: 'cancelled', cancelledAt: new Date().toISOString() },
              holder,
              'cancellation'
            )
          );
          toast.success('Booking cancelled — record downloaded');
        }}
        title="Cancel this booking?"
        message={
        <>
            This cannot be undone. Your slot at <strong>{booking.centre}</strong>{' '}
            is released and the R22 online booking fee is not refundable. We will
            download a cancellation record for you.
          </>
        }
        confirmLabel="Cancel booking" />
      

      <RescheduleModal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        currentLabel={`${booking.centre} · ${formatDateTime(booking.appointmentAt)}`}
        currentCentreId={booking.centreId}
        onConfirm={(centre, appointmentAt) => {
          dispatch({
            type: 'RESCHEDULE_BOOKING',
            payload: {
              id: booking.id,
              centreId: centre.id,
              centre: centre.name,
              appointmentAt
            }
          });
          toast.success(`Moved to ${formatDateTime(appointmentAt)}`);
        }} />
      
    </li>);

}