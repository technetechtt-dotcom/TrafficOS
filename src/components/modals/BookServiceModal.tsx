import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { SlotPicker, toAppointmentIso } from '../booking/SlotPicker';
import { useAppStore } from '../../stores/useAppStore';
import {
  drivingCodes,
  learnerCodes,
  prdpCategories,
  testingCentres } from
'../../data/natisServices';
import { formatCurrency } from '../../utils/formatters';
import {
  formatDateTime,
  NATIS_FEES,
  SERVICE_LABELS } from
'../../utils/natis';
import {
  generateReceiptNumber,
  PAYMENT_METHODS,
  downloadTextFile } from
'../../utils/payments';
import { buildBookingText } from '../../utils/bookingDocuments';
import { PaymentMethod, ServiceBooking } from '../../types';
import {
  CheckCircleIcon,
  ChevronRightIcon,
  DownloadIcon,
  InfoIcon,
  LockIcon } from
'lucide-react';
import { toast } from 'sonner';

export type DirectService = 'learner-test' | 'driving-test' | 'prdp';

interface BookServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: DirectService;
}

type Step = 'code' | 'slot' | 'pay' | 'done';

const SERVICE_CONFIG: Record<
  DirectService,
  {
    fee: number;
    codeLabel: string;
    codes: {id: string;label: string;description: string;}[];
    requirements: string[];
    bring: string[];
  }> =
{
  'learner-test': {
    fee: NATIS_FEES.learnerTest,
    codeLabel: 'Learner licence code',
    codes: learnerCodes,
    requirements: [
    'You must be 17 or older (16 for motorcycles up to 125cc).',
    'The test is a written or computer-based K53 knowledge test.'],

    bring: [
    'Green ID book, smart ID card or valid passport',
    'Two black-and-white ID photos (unless the centre captures them)',
    'Proof of residence not older than three months']

  },
  'driving-test': {
    fee: NATIS_FEES.drivingTest,
    codeLabel: 'Licence code to test for',
    codes: drivingCodes,
    requirements: [
    "You need a valid learner's licence for the same code.",
    'You must bring a roadworthy vehicle of the right class.'],

    bring: [
    'Your ID and valid learner’s licence',
    'A licensed, roadworthy test vehicle with L-plates',
    'Proof of residence not older than three months']

  },
  prdp: {
    fee: NATIS_FEES.prdpApplication,
    codeLabel: 'Permit category',
    codes: prdpCategories,
    requirements: [
    'Category G from 18, Category P and D from 21.',
    'You must have held a driving licence for at least two years.',
    'A medical certificate (MC1) and police clearance are required.'],

    bring: [
    'Your ID and driving licence card',
    'Medical certificate (MC1) completed by a doctor',
    'SAPS police clearance (fingerprints taken at the centre)']

  }
};

export function BookServiceModal({ isOpen, onClose, service }: BookServiceModalProps) {
  const { state, dispatch } = useAppStore();
  const config = SERVICE_CONFIG[service];
  const [step, setStep] = useState<Step>('code');
  const [code, setCode] = useState(config.codes[0].id);
  const [slot, setSlot] = useState<{
    centreId: string;
    date: string | null;
    time: string | null;
  }>({ centreId: testingCentres[0].id, date: null, time: null });
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [booking, setBooking] = useState<ServiceBooking | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('code');
      setCode(SERVICE_CONFIG[service].codes[0].id);
      setSlot({ centreId: testingCentres[0].id, date: null, time: null });
      setMethod('card');
      setBooking(null);
    }
  }, [isOpen, service]);

  const centre =
  testingCentres.find((c) => c.id === slot.centreId) ?? testingCentres[0];
  const appointmentAt =
  slot.date && slot.time ? toAppointmentIso(slot.date, slot.time) : null;
  const total = config.fee + NATIS_FEES.onlineBookingFee;
  const codeMeta = config.codes.find((c) => c.id === code);

  const handlePay = () => {
    if (!appointmentAt) return;
    setIsProcessing(true);
    setTimeout(() => {
      const receiptNumber = generateReceiptNumber('BKG');
      const now = new Date().toISOString();
      const newBooking: ServiceBooking = {
        id: `bk_${Date.now()}`,
        service,
        licenceCode: codeMeta?.label,
        centreId: centre.id,
        centre: centre.name,
        appointmentAt,
        status: 'confirmed',
        fee: total,
        receiptNumber,
        createdAt: now,
        rescheduleCount: 0,
        source: 'direct'
      };
      dispatch({ type: 'ADD_BOOKING', payload: newBooking });
      dispatch({
        type: 'ADD_PAYMENT',
        payload: {
          id: `pay_${Date.now()}`,
          purpose: 'test-booking',
          description: `${SERVICE_LABELS[service]} (${codeMeta?.label}) — ${centre.name}`,
          reference: receiptNumber,
          receiptNumber,
          subtotal: config.fee,
          discount: 0,
          serviceFee: NATIS_FEES.onlineBookingFee,
          total,
          method,
          methodDetail: method === 'card' ? 'Visa ···4242' : 'Instant EFT · Capitec',
          paidAt: now,
          status: 'succeeded',
          authority: 'Driving Licence Testing Centre'
        }
      });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `notif_${Date.now()}`,
          title: `${SERVICE_LABELS[service]} booked`,
          message: `${centre.name} on ${formatDateTime(appointmentAt)}. Booking ${receiptNumber}.`,
          type: 'licence',
          read: false,
          createdAt: now,
          linkTab: 'licence-services'
        }
      });
      setBooking(newBooking);
      setIsProcessing(false);
      setStep('done');
      toast.success('Booking confirmed');
    }, 1500);
  };

  const titles: Record<Step, string> = {
    code: SERVICE_LABELS[service],
    slot: 'Choose a centre and time',
    pay: 'Confirm and pay',
    done: 'Booking confirmed'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titles[step]} maxWidth="lg">
      {step === 'code' &&
      <div className="space-y-5">
          <fieldset>
            <legend className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              {config.codeLabel}
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {config.codes.map((c) => {
              const isSelected = c.id === code;
              return (
                <button
                  type="button"
                  key={c.id}
                  aria-pressed={isSelected}
                  onClick={() => setCode(c.id)}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                  isSelected ?
                  'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500' :
                  'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`
                  }>
                  
                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                      {c.label}
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {c.description}
                    </span>
                  </button>);

            })}
            </div>
          </fieldset>

          <div className="flex items-start gap-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5">
            <InfoIcon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1 leading-relaxed">
              {config.requirements.map((r) =>
            <li key={r}>{r}</li>
            )}
            </ul>
          </div>

          <Button
          fullWidth
          rightIcon={<ChevronRightIcon className="w-4 h-4" />}
          onClick={() => setStep('slot')}>
          
            Continue
          </Button>
        </div>
      }

      {step === 'slot' &&
      <div className="space-y-5">
          <SlotPicker
          centreId={slot.centreId}
          date={slot.date}
          time={slot.time}
          onChange={setSlot} />
        
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button variant="secondary" onClick={() => setStep('code')}>
              Back
            </Button>
            <Button
            fullWidth
            disabled={!appointmentAt}
            onClick={() => setStep('pay')}>
            
              {appointmentAt ? 'Continue to payment' : 'Pick a date and time'}
            </Button>
          </div>
        </div>
      }

      {step === 'pay' && appointmentAt &&
      <div className="space-y-5">
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              {SERVICE_LABELS[service]} · {codeMeta?.label}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-0.5">
              {centre.name} · {formatDateTime(appointmentAt)}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Test / application fee</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(config.fee)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Online booking fee (RTMC)
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(NATIS_FEES.onlineBookingFee)}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-2.5 border-t border-gray-200 dark:border-gray-700">
              <span className="font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <div className="space-y-2" role="radiogroup" aria-label="Payment method">
            {PAYMENT_METHODS.slice(0, 3).map((m) => {
            const isSelected = method === m.id;
            return (
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-colors ${
                isSelected ?
                'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500' :
                'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`
                }>
                
                  <span>
                    <span className="block text-sm font-medium text-gray-900 dark:text-white">
                      {m.label}
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      {m.description}
                    </span>
                  </span>
                  {isSelected &&
                <CheckCircleIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                }
                </button>);

          })}
          </div>

          <p className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <LockIcon className="w-3 h-3" />
            Paid to the testing centre via NaTIS
          </p>

          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button variant="secondary" onClick={() => setStep('slot')}>
              Back
            </Button>
            <Button fullWidth isLoading={isProcessing} onClick={handlePay}>
              Pay {formatCurrency(total)}
            </Button>
          </div>
        </div>
      }

      {step === 'done' && booking &&
      <div className="space-y-5">
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
              <CheckCircleIcon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="font-bold text-gray-900 dark:text-white text-lg">
              {formatDateTime(booking.appointmentAt)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {booking.centre} · ref {booking.receiptNumber}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Bring with you
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1.5">
              {config.bring.map((b) =>
            <li key={b}>· {b}</li>
            )}
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
            variant="secondary"
            fullWidth
            leftIcon={<DownloadIcon className="w-4 h-4" />}
            onClick={() =>
            downloadTextFile(
              `Booking_${booking.receiptNumber}.txt`,
              buildBookingText(booking, state.user?.name ?? 'Applicant', 'confirmation')
            )
            }>
            
              Download confirmation
            </Button>
            <Button fullWidth onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      }
    </Modal>);

}