import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAppStore } from '../../stores/useAppStore';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  generateReceiptNumber,
  PAYMENT_METHODS,
  buildReceiptText,
  downloadTextFile } from
'../../utils/payments';
import { PaymentMethod, PaymentRecord } from '../../types';
import {
  CalendarIcon,
  CheckCircleIcon,
  MapPinIcon,
  DownloadIcon,
  LockIcon,
  ChevronRightIcon } from
'lucide-react';
import { toast } from 'sonner';

interface RenewDriverLicenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'centre' | 'fees' | 'payment' | 'done';

const TESTING_CENTRES = [
{
  id: 'tc_1',
  name: 'Randburg Licensing Department',
  area: 'Randburg, Gauteng',
  nextSlot: 6
},
{
  id: 'tc_2',
  name: 'Sandton Licensing Centre',
  area: 'Sandton, Gauteng',
  nextSlot: 12
},
{
  id: 'tc_3',
  name: 'Gallows Hill Traffic Department',
  area: 'Green Point, Cape Town',
  nextSlot: 3
},
{
  id: 'tc_4',
  name: 'Pinetown Licensing Office',
  area: 'Pinetown, KwaZulu-Natal',
  nextSlot: 9
}];


const RENEWAL_FEE = 250;
const TEMPORARY_FEE = 90;
const BOOKING_FEE = 35;

export function RenewDriverLicenceModal({
  isOpen,
  onClose
}: RenewDriverLicenceModalProps) {
  const { state, dispatch } = useAppStore();
  const [step, setStep] = useState<Step>('centre');
  const [centreId, setCentreId] = useState(TESTING_CENTRES[0].id);
  const [wantsTemporary, setWantsTemporary] = useState(true);
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<PaymentRecord | null>(null);

  const centre =
  TESTING_CENTRES.find((c) => c.id === centreId) ?? TESTING_CENTRES[0];
  const appointmentDate = new Date(
    Date.now() + centre.nextSlot * 86400000
  ).toISOString();
  const total = RENEWAL_FEE + (wantsTemporary ? TEMPORARY_FEE : 0) + BOOKING_FEE;

  const reset = () => {
    setStep('centre');
    setWantsTemporary(true);
    setMethod('card');
    setIsProcessing(false);
    setReceipt(null);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 250);
  };

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const receiptNumber = generateReceiptNumber('DLC');
      const record: PaymentRecord = {
        id: `pay_${Date.now()}`,
        purpose: 'driver-licence',
        description: `Driving licence card renewal — ${centre.name}`,
        reference: state.driverLicence?.licenceNumber ?? 'DL',
        receiptNumber,
        subtotal: RENEWAL_FEE + (wantsTemporary ? TEMPORARY_FEE : 0),
        discount: 0,
        serviceFee: BOOKING_FEE,
        total,
        method,
        methodDetail:
        method === 'card' ? 'Visa ···4242' : 'Instant EFT · Capitec',
        paidAt: new Date().toISOString(),
        status: 'succeeded',
        authority: 'Department of Transport — DLCA'
      };

      dispatch({
        type: 'ADD_PAYMENT',
        payload: record
      });
      dispatch({
        type: 'START_LICENCE_RENEWAL',
        payload: {
          id: `dlapp_${Date.now()}`,
          stage: 'booked',
          testingCentre: centre.name,
          appointmentDate,
          fee: total,
          receiptNumber,
          createdAt: new Date().toISOString()
        }
      });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `notif_${Date.now()}`,
          title: 'Licence Renewal Booked',
          message: `Your appointment at ${centre.name} is confirmed for ${formatDate(appointmentDate)}. Bring your ID and current card.`,
          type: 'licence',
          read: false,
          createdAt: new Date().toISOString(),
          linkTab: 'driver-licence'
        }
      });

      setReceipt(record);
      setIsProcessing(false);
      setStep('done');
      toast.success('Renewal appointment booked');
    }, 1800);
  };

  const feeRows =
  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2.5">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">
          Renewal application (5 years)
        </span>
        <span className="font-medium text-gray-900 dark:text-white">
          {formatCurrency(RENEWAL_FEE)}
        </span>
      </div>
      {wantsTemporary &&
    <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Temporary driving licence
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(TEMPORARY_FEE)}
          </span>
        </div>
    }
      <div className="flex justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">
          TrafficOS booking fee
        </span>
        <span className="font-medium text-gray-900 dark:text-white">
          {formatCurrency(BOOKING_FEE)}
        </span>
      </div>
      <div className="flex justify-between items-baseline pt-2.5 border-t border-gray-200 dark:border-gray-700">
        <span className="font-semibold text-gray-900 dark:text-white">
          Total
        </span>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(total)}
        </span>
      </div>
    </div>;


  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
      step === 'done' ? 'Appointment Confirmed' : 'Renew Driving Licence'
      }
      maxWidth="md">
      
      {step === 'centre' &&
      <div className="space-y-5">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Pick a testing centre. You must attend in person for the eye test,
            photograph and fingerprints — we handle the booking and the fees.
          </p>

          <div className="space-y-2">
            {TESTING_CENTRES.map((c) => {
            const isSelected = centreId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCentreId(c.id)}
                aria-pressed={isSelected}
                className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-colors ${
                isSelected ?
                'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500' :
                'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`
                }>
                
                  <MapPinIcon
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                
                  <span className="flex-1 min-w-0">
                    <span className="block font-medium text-gray-900 dark:text-white text-sm">
                      {c.name}
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {c.area}
                    </span>
                    <span className="block text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                      Next slot in {c.nextSlot} days ·{' '}
                      {formatDate(
                      new Date(Date.now() + c.nextSlot * 86400000).toISOString()
                    )}
                    </span>
                  </span>
                </button>);

          })}
          </div>

          <Button
          variant="primary"
          fullWidth
          rightIcon={<ChevronRightIcon className="w-4 h-4" />}
          onClick={() => setStep('fees')}>
          
            Continue
          </Button>
        </div>
      }

      {step === 'fees' &&
      <div className="space-y-5">
          <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-200 text-sm">
                {centre.name}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {formatDate(appointmentDate)} · arrive 15 minutes early
              </p>
            </div>
          </div>

          <button
          onClick={() => setWantsTemporary(!wantsTemporary)}
          className="w-full flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          
            <span
            className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
            wantsTemporary ?
            'bg-blue-600 border-blue-600' :
            'border-gray-300 dark:border-gray-600'}`
            }>
            
              {wantsTemporary &&
            <CheckCircleIcon className="w-3.5 h-3.5 text-white" />
            }
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium text-gray-900 dark:text-white">
                Add a temporary driving licence
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Keeps you legal to drive while the card is produced — usually
                four to six weeks. Recommended if your card expires soon.
              </span>
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white flex-shrink-0">
              {formatCurrency(TEMPORARY_FEE)}
            </span>
          </button>

          {feeRows}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
            variant="secondary"
            onClick={() => setStep('centre')}
            className="sm:w-auto">
            
              Back
            </Button>
            <Button
            variant="primary"
            fullWidth
            onClick={() => setStep('payment')}>
            
              Continue to payment
            </Button>
          </div>
        </div>
      }

      {step === 'payment' &&
      <div className="space-y-5">
          {feeRows}

          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Payment method
            </h4>
            <div className="space-y-2">
              {PAYMENT_METHODS.slice(0, 3).map((m) => {
              const isSelected = method === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  aria-pressed={isSelected}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-colors ${
                  isSelected ?
                  'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500' :
                  'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`
                  }>
                  
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-gray-900 dark:text-white">
                        {m.label}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">
                        {m.description}
                      </span>
                    </span>
                    <span
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    isSelected ?
                    'border-blue-600 dark:border-blue-500' :
                    'border-gray-300 dark:border-gray-600'}`
                    }>
                    
                      {isSelected &&
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-500" />
                    }
                    </span>
                  </button>);

            })}
            </div>
          </div>

          <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 gap-1">
            <LockIcon className="w-3 h-3" />
            Paid directly to the licensing authority
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
            variant="secondary"
            onClick={() => setStep('fees')}
            className="sm:w-auto">
            
              Back
            </Button>
            <Button
            variant="primary"
            fullWidth
            isLoading={isProcessing}
            onClick={handlePay}>
            
              Pay {formatCurrency(total)}
            </Button>
          </div>
        </div>
      }

      {step === 'done' && receipt &&
      <div className="space-y-6">
          <div className="flex flex-col items-center text-center py-2">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              You're booked
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              {centre.name} on {formatDate(appointmentDate)}.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2 text-sm">
            <p className="font-semibold text-gray-900 dark:text-white mb-2">
              Bring with you
            </p>
            <ul className="space-y-1.5 text-gray-600 dark:text-gray-300">
              <li>· Your current driving licence card</li>
              <li>· Your green ID book or smart ID card</li>
              <li>· Proof of residence not older than three months</li>
              <li>· This booking receipt ({receipt.receiptNumber})</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
            variant="secondary"
            fullWidth
            leftIcon={<DownloadIcon className="w-4 h-4" />}
            onClick={() =>
            downloadTextFile(
              `Booking_${receipt.receiptNumber}.txt`,
              buildReceiptText(receipt, state.user?.name ?? 'Applicant')
            )
            }>
            
              Download receipt
            </Button>
            <Button variant="primary" fullWidth onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      }
    </Modal>);

}