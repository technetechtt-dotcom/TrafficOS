import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Fine, PaymentMethod, PaymentRecord } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useAppStore } from '../../stores/useAppStore';
import {
  calculateFineFees,
  PAYMENT_METHODS,
  generateReceiptNumber,
  buildReceiptText,
  downloadTextFile,
  methodLabel } from
'../../utils/payments';
import {
  CheckCircleIcon,
  LockIcon,
  DownloadIcon,
  TagIcon,
  AlertTriangleIcon,
  SmartphoneIcon,
  BuildingIcon,
  CreditCardIcon,
  ChevronRightIcon } from
'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  fine: Fine | null;
}

type Step = 'method' | 'details' | 'success';

const METHOD_ICONS: Record<PaymentMethod, React.ReactNode> = {
  card: <CreditCardIcon className="w-5 h-5" />,
  'instant-eft': <BuildingIcon className="w-5 h-5" />,
  ozow: <BuildingIcon className="w-5 h-5" />,
  snapscan: <SmartphoneIcon className="w-5 h-5" />,
  payfast: <CreditCardIcon className="w-5 h-5" />
};

export function PaymentModal({ isOpen, onClose, fine }: PaymentModalProps) {
  const { state, dispatch } = useAppStore();
  const [step, setStep] = useState<Step>('method');
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<PaymentRecord | null>(null);
  const [cardName, setCardName] = useState('');

  const reset = () => {
    setStep('method');
    setMethod('card');
    setIsProcessing(false);
    setReceipt(null);
    setCardName('');
  };

  const handleClose = () => {
    onClose();
    // Let the exit animation finish before resetting internal state
    setTimeout(reset, 250);
  };

  if (!fine) return null;

  const fees = calculateFineFees(fine);

  const methodDetailFor = (m: PaymentMethod): string => {
    switch (m) {
      case 'card':
        return 'Visa ···4242';
      case 'instant-eft':
        return 'FNB cheque account ···4417';
      case 'ozow':
        return 'Ozow instant EFT · Capitec';
      case 'snapscan':
        return 'SnapScan wallet';
      case 'payfast':
        return 'PayFast checkout';
    }
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const record: PaymentRecord = {
        id: `pay_${Date.now()}`,
        purpose: 'fine',
        description: `${fine.offenceType} — ${fine.offenceDescription}`,
        reference: fine.referenceNumber,
        receiptNumber: generateReceiptNumber(),
        subtotal: fees.subtotal,
        discount: fees.discount,
        serviceFee: fees.serviceFee + fees.courtesyFee,
        total: fees.total,
        method,
        methodDetail: methodDetailFor(method),
        paidAt: new Date().toISOString(),
        status: 'succeeded',
        fineId: fine.id,
        vehicleId: fine.vehicleId,
        authority: fine.issuedBy
      };

      dispatch({
        type: 'ADD_PAYMENT',
        payload: record
      });
      dispatch({
        type: 'UPDATE_FINE_STATUS',
        payload: {
          id: fine.id,
          status: 'paid'
        }
      });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `notif_${Date.now()}`,
          title: 'Payment Successful',
          message: `Your payment of ${formatCurrency(record.total)} for ${fine.referenceNumber} was received. Receipt ${record.receiptNumber}.`,
          type: 'payment',
          read: false,
          createdAt: new Date().toISOString(),
          fineId: fine.id,
          linkTab: 'payments'
        }
      });

      setReceipt(record);
      setIsProcessing(false);
      setStep('success');
    }, 1800);
  };

  const handleDownloadReceipt = () => {
    if (!receipt) return;
    downloadTextFile(
      `Receipt_${receipt.receiptNumber}.txt`,
      buildReceiptText(receipt, state.user?.name ?? 'Account holder')
    );
  };

  const feeRows =
  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2.5">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500 dark:text-gray-400">
          Penalty ({fine.referenceNumber})
        </span>
        <span className="font-medium text-gray-900 dark:text-white">
          {formatCurrency(fees.subtotal)}
        </span>
      </div>

      {fees.discount > 0 &&
    <div className="flex justify-between items-start text-sm gap-3">
          <span className="text-emerald-700 dark:text-emerald-400 flex items-start gap-1.5 min-w-0">
            <TagIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Early-payment discount
              <span className="block text-xs text-emerald-600/80 dark:text-emerald-400/70">
                {fees.daysRemaining}{' '}
                {fees.daysRemaining === 1 ? 'day' : 'days'} left in the 32-day
                window
              </span>
            </span>
          </span>
          <span className="font-medium text-emerald-700 dark:text-emerald-400 flex-shrink-0">
            −{formatCurrency(fees.discount)}
          </span>
        </div>
    }

      {fees.courtesyFee > 0 &&
    <div className="flex justify-between items-start text-sm gap-3">
          <span className="text-red-700 dark:text-red-400 flex items-start gap-1.5 min-w-0">
            <AlertTriangleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Courtesy letter fee
              <span className="block text-xs text-red-600/80 dark:text-red-400/70">
                Applied because the due date has passed
              </span>
            </span>
          </span>
          <span className="font-medium text-red-700 dark:text-red-400 flex-shrink-0">
            {formatCurrency(fees.courtesyFee)}
          </span>
        </div>
    }

      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500 dark:text-gray-400">Service fee</span>
        <span className="font-medium text-gray-900 dark:text-white">
          {formatCurrency(fees.serviceFee)}
        </span>
      </div>

      <div className="flex justify-between items-baseline pt-2.5 border-t border-gray-200 dark:border-gray-700">
        <span className="font-semibold text-gray-900 dark:text-white">
          Total due
        </span>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(fees.total)}
        </span>
      </div>
    </div>;


  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'success' ? 'Payment Complete' : 'Pay Fine'}
      maxWidth="md">
      
      {step === 'success' && receipt ?
      <div className="space-y-6">
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {formatCurrency(receipt.total)} paid
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {fine.referenceNumber} is settled with {fine.issuedBy}.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Receipt number
              </span>
              <span className="font-mono font-medium text-gray-900 dark:text-white">
                {receipt.receiptNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Paid with
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {methodLabel(receipt.method)}
              </span>
            </div>
            {receipt.discount > 0 &&
          <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  You saved
                </span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(receipt.discount)}
                </span>
              </div>
          }
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
            variant="secondary"
            fullWidth
            leftIcon={<DownloadIcon className="w-4 h-4" />}
            onClick={handleDownloadReceipt}>
            
              Download receipt
            </Button>
            <Button
            variant="primary"
            fullWidth
            onClick={() => {
              handleClose();
              dispatch({
                type: 'SET_TAB',
                payload: 'payments'
              });
            }}>
            
              View all payments
            </Button>
          </div>
        </div> :
      step === 'method' ?
      <div className="space-y-6">
          {feeRows}

          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              How would you like to pay?
            </h4>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((m) => {
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
                  
                    <span
                    className={
                    isSelected ?
                    'text-blue-600 dark:text-blue-400' :
                    'text-gray-400'
                    }>
                    
                      {METHOD_ICONS[m.id]}
                    </span>
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

          <Button
          variant="primary"
          fullWidth
          rightIcon={<ChevronRightIcon className="w-4 h-4" />}
          onClick={() => setStep('details')}>
          
            Continue
          </Button>
        </div> :

      <form onSubmit={handlePay} className="space-y-6">
          {feeRows}

          {method === 'card' || method === 'payfast' ?
        <div className="space-y-4">
              <Input
            label="Card Number"
            placeholder="0000 0000 0000 0000"
            required
            maxLength={19} />
          
              <div className="grid grid-cols-2 gap-4">
                <Input
              label="Expiry Date"
              placeholder="MM/YY"
              required
              maxLength={5} />
            
                <Input
              label="CVV"
              placeholder="123"
              type="password"
              required
              maxLength={4} />
            
              </div>
              <Input
            label="Cardholder Name"
            placeholder="Name on card"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            required />
          
            </div> :
        method === 'snapscan' ?
        <div className="flex flex-col items-center text-center py-2">
              <div className="w-40 h-40 rounded-2xl bg-gray-900 dark:bg-white p-4 mb-4">
                <div
              className="w-full h-full"
              style={{
                backgroundImage:
                'repeating-conic-gradient(#fff 0% 25%, #111 0% 50%)',
                backgroundSize: '16px 16px'
              }}
              role="img"
              aria-label="SnapScan QR code" />
            
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                Open SnapScan on your phone and scan this code to authorise{' '}
                {formatCurrency(fees.total)}.
              </p>
            </div> :

        <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Select your bank
                </label>
                <select
              required
              className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white min-h-[44px] px-4">
              
                  <option>Absa</option>
                  <option>Capitec</option>
                  <option>Discovery Bank</option>
                  <option>FNB</option>
                  <option>Investec</option>
                  <option>Nedbank</option>
                  <option>Standard Bank</option>
                  <option>TymeBank</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                You will be redirected to your bank to authorise this payment.
                No card details are shared.
              </p>
            </div>
        }

          <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 gap-1">
            <LockIcon className="w-3 h-3" />
            PCI-DSS compliant · 256-bit encrypted
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
            type="button"
            variant="secondary"
            onClick={() => setStep('method')}
            className="sm:w-auto">
            
              Back
            </Button>
            <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isProcessing}>
            
              Pay {formatCurrency(fees.total)}
            </Button>
          </div>
        </form>
      }
    </Modal>);

}