import React, { useMemo, useState, createElement } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Vehicle, LicenseDiscApplication } from '../../types';
import { useAppStore } from '../../stores/useAppStore';
import { calculateRenewalFees, getDiscStatus } from '../../utils/license';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  CheckCircleIcon,
  LockIcon,
  CarIcon,
  ShieldIcon,
  DownloadIcon,
  AlertTriangleIcon,
  ChevronRightIcon,
  ChevronLeftIcon } from
'lucide-react';
interface RenewLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}
type Step = 'review' | 'fees' | 'payment' | 'success';
export function RenewLicenseModal({
  isOpen,
  onClose,
  vehicle
}: RenewLicenseModalProps) {
  const { dispatch } = useAppStore();
  const [step, setStep] = useState<Step>('review');
  const [isProcessing, setIsProcessing] = useState(false);
  const [application, setApplication] = useState<LicenseDiscApplication | null>(
    null
  );
  const fees = useMemo(
    () => vehicle ? calculateRenewalFees(vehicle) : null,
    [vehicle]
  );
  const status = vehicle ? getDiscStatus(vehicle.licenseDiscExpiry) : 'valid';
  const handleClose = () => {
    onClose();
    // Reset after close animation
    setTimeout(() => {
      setStep('review');
      setApplication(null);
    }, 300);
  };
  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle || !fees) return;
    setIsProcessing(true);
    setTimeout(() => {
      const now = new Date();
      const validUntil = new Date();
      validUntil.setFullYear(validUntil.getFullYear() + 1);
      const newApp: LicenseDiscApplication = {
        id: `lic_app_${Date.now()}`,
        vehicleId: vehicle.id,
        licensePlate: vehicle.licensePlate,
        applicationType: 'renewal',
        baseFee: fees.baseFee,
        arrearFee: fees.arrearFee,
        adminFee: fees.adminFee,
        totalAmount: fees.total,
        status: 'issued',
        createdAt: now.toISOString(),
        paidAt: now.toISOString(),
        validFrom: now.toISOString(),
        validUntil: validUntil.toISOString(),
        receiptNumber: `TFOS-LIC-${Math.floor(Math.random() * 900000) + 100000}`,
        discNumber: `${vehicle.licensePlate.split(' ')[0]}-DC-${Math.floor(Math.random() * 900000) + 100000}`
      };
      dispatch({
        type: 'RENEW_LICENSE',
        payload: {
          application: newApp,
          vehicleId: vehicle.id,
          newExpiry: validUntil.toISOString()
        }
      });
      // Record the transaction so it appears in Payments & Receipts
      dispatch({
        type: 'ADD_PAYMENT',
        payload: {
          id: `pay_${Date.now()}`,
          purpose: 'licence-disc',
          description: `Motor vehicle licence disc renewal — ${vehicle.licensePlate}`,
          reference: newApp.discNumber ?? newApp.id,
          receiptNumber: newApp.receiptNumber,
          subtotal: fees.baseFee + fees.arrearFee,
          discount: 0,
          serviceFee: fees.adminFee,
          total: fees.total,
          method: 'card',
          methodDetail: 'Visa ···4242',
          paidAt: now.toISOString(),
          status: 'succeeded',
          vehicleId: vehicle.id,
          authority: 'Provincial Licensing Department'
        }
      });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `notif_${Date.now()}`,
          title: 'Licence Disc Renewed',
          message: `${vehicle.licensePlate} is licensed until ${formatDate(validUntil.toISOString())}. Receipt ${newApp.receiptNumber}.`,
          type: 'licence',
          read: false,
          createdAt: now.toISOString(),
          vehicleId: vehicle.id,
          linkTab: 'licenses'
        }
      });
      setApplication(newApp);
      setIsProcessing(false);
      setStep('success');
      toast.success('License disc renewed successfully');
    }, 2200);
  };
  const handleDownloadDisc = () => {
    if (!application || !vehicle) return;
    const discText = `
═══════════════════════════════════════════
       SOUTH AFRICAN MOTOR VEHICLE
          LICENSE DISC CERTIFICATE
═══════════════════════════════════════════

License Number:    ${application.discNumber}
Receipt Number:    ${application.receiptNumber}

VEHICLE DETAILS
───────────────────────────────────────────
Registration:      ${vehicle.licensePlate}
Make / Model:      ${vehicle.make} ${vehicle.model}
Year:              ${vehicle.year}
Colour:            ${vehicle.color}
VIN:               ${vehicle.vin}
Engine Number:     ${vehicle.engineNumber || 'N/A'}
Tare Weight:       ${vehicle.tareWeight} kg

VALIDITY
───────────────────────────────────────────
Valid From:        ${formatDate(application.validFrom!)}
Valid Until:       ${formatDate(application.validUntil!)}

PAYMENT SUMMARY
───────────────────────────────────────────
Base Fee:          ${formatCurrency(application.baseFee)}
Admin Fee:         ${formatCurrency(application.adminFee)}
Arrears:           ${formatCurrency(application.arrearFee)}
TOTAL PAID:        ${formatCurrency(application.totalAmount)}

═══════════════════════════════════════════
Issued via TrafficOS SA
${new Date().toLocaleString('en-ZA')}
═══════════════════════════════════════════
`.trim();
    const blob = new Blob([discText], {
      type: 'text/plain;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LicenseDisc_${vehicle.licensePlate.replace(/\s/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('License disc downloaded');
  };
  if (!vehicle || !fees) return null;
  const titles: Record<Step, string> = {
    review: 'Review Vehicle Details',
    fees: 'Fee Breakdown',
    payment: 'Secure Payment',
    success: 'License Renewed'
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={step === 'success' ? handleClose : handleClose}
      title={titles[step]}
      maxWidth="md">
      
      {/* Progress dots (hide on success) */}
      {step !== 'success' &&
      <div className="flex items-center justify-center gap-2 mb-6">
          {(['review', 'fees', 'payment'] as Step[]).map((s, idx) => {
          const currentIdx = ['review', 'fees', 'payment'].indexOf(step);
          const isActive = idx === currentIdx;
          const isComplete = idx < currentIdx;
          return (
            <div key={s} className="flex items-center gap-2">
                <div
                className={`h-1.5 rounded-full transition-all ${isActive ? 'w-8 bg-blue-600' : isComplete ? 'w-4 bg-blue-600' : 'w-4 bg-gray-200 dark:bg-gray-800'}`} />
              
              </div>);

        })}
        </div>
      }

      <AnimatePresence mode="wait">
        {step === 'review' &&
        <motion.div
          key="review"
          initial={{
            opacity: 0,
            x: 20
          }}
          animate={{
            opacity: 1,
            x: 0
          }}
          exit={{
            opacity: 0,
            x: -20
          }}
          className="space-y-5">
          
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                <CarIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white truncate">
                  {vehicle.licensePlate}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {vehicle.year} {vehicle.make} {vehicle.model} ·{' '}
                  {vehicle.color}
                </p>
              </div>
            </div>

            {status === 'expired' &&
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl p-3 text-sm flex items-start gap-2">
                <AlertTriangleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Your disc has expired. Arrears penalties will be applied.
                </span>
              </div>
          }

            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Vehicle Information
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <DetailField label="VIN" value={vehicle.vin} />
                <DetailField
                label="Engine No."
                value={vehicle.engineNumber || 'N/A'} />
              
                <DetailField
                label="Tare Weight"
                value={`${vehicle.tareWeight || 1000} kg`} />
              
                <DetailField
                label="Current Expiry"
                value={
                vehicle.licenseDiscExpiry ?
                formatDate(vehicle.licenseDiscExpiry) :
                '—'
                } />
              
              </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              By proceeding, you confirm these details are accurate and
              authorize a roadworthiness check via eNaTIS.
            </div>

            <Button
            variant="primary"
            fullWidth
            onClick={() => setStep('fees')}
            rightIcon={<ChevronRightIcon className="w-4 h-4" />}>
            
              Continue to Fees
            </Button>
          </motion.div>
        }

        {step === 'fees' &&
        <motion.div
          key="fees"
          initial={{
            opacity: 0,
            x: 20
          }}
          animate={{
            opacity: 1,
            x: 0
          }}
          exit={{
            opacity: 0,
            x: -20
          }}
          className="space-y-5">
          
            <div className="space-y-3">
              <FeeRow
              label="License Fee"
              sublabel={`Based on ${vehicle.tareWeight} kg tare weight`}
              amount={fees.baseFee} />
            
              <FeeRow
              label="Admin Fee"
              sublabel="eNaTIS processing"
              amount={fees.adminFee} />
            
              {fees.arrearFee > 0 &&
            <FeeRow
              label="Arrears Penalty"
              sublabel="Disc expired beyond grace period"
              amount={fees.arrearFee}
              isWarning />

            }

              <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-white">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(fees.total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Your new license disc will be valid for{' '}
              <strong className="text-gray-900 dark:text-white">
                12 months
              </strong>{' '}
              from the date of payment.
            </div>

            <div className="flex gap-3">
              <Button
              variant="ghost"
              onClick={() => setStep('review')}
              leftIcon={<ChevronLeftIcon className="w-4 h-4" />}>
              
                Back
              </Button>
              <Button
              variant="primary"
              onClick={() => setStep('payment')}
              className="flex-1"
              rightIcon={<ChevronRightIcon className="w-4 h-4" />}>
              
                Proceed to Payment
              </Button>
            </div>
          </motion.div>
        }

        {step === 'payment' &&
        <motion.form
          key="payment"
          initial={{
            opacity: 0,
            x: 20
          }}
          animate={{
            opacity: 1,
            x: 0
          }}
          exit={{
            opacity: 0,
            x: -20
          }}
          onSubmit={handlePayment}
          className="space-y-5">
          
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Amount Due
              </span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(fees.total)}
              </span>
            </div>

            <div className="space-y-4">
              <Input
              label="Card Number"
              placeholder="0000 0000 0000 0000"
              required
              maxLength={19}
              defaultValue="4242 4242 4242 4242" />
            
              <div className="grid grid-cols-2 gap-3">
                <Input
                label="Expiry"
                placeholder="MM/YY"
                required
                maxLength={5}
                defaultValue="12/27" />
              
                <Input
                label="CVV"
                type="password"
                placeholder="123"
                required
                maxLength={4}
                defaultValue="123" />
              
              </div>
              <Input
              label="Cardholder Name"
              placeholder="Name on card"
              required
              defaultValue="T. Mokoena" />
            
            </div>

            <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 gap-1">
              <LockIcon className="w-3 h-3" />
              Secured by 256-bit encryption · PCI-DSS compliant
            </div>

            <div className="flex gap-3">
              <Button
              type="button"
              variant="ghost"
              onClick={() => setStep('fees')}
              leftIcon={<ChevronLeftIcon className="w-4 h-4" />}>
              
                Back
              </Button>
              <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isProcessing}>
              
                Pay {formatCurrency(fees.total)}
              </Button>
            </div>
          </motion.form>
        }

        {step === 'success' && application &&
        <motion.div
          key="success"
          initial={{
            opacity: 0,
            scale: 0.95
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          className="text-center">
          
            <motion.div
            initial={{
              scale: 0
            }}
            animate={{
              scale: 1
            }}
            transition={{
              type: 'spring',
              delay: 0.1,
              stiffness: 200
            }}
            className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            
              <CheckCircleIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </motion.div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              License Disc Issued
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Your new disc is valid until{' '}
              <strong className="text-gray-900 dark:text-white">
                {formatDate(application.validUntil!)}
              </strong>
            </p>

            {/* Digital disc card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white text-left mb-5 relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10">
                <ShieldIcon className="w-32 h-32 -mt-4 -mr-4" />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-blue-200 mb-1">
                      License Disc
                    </p>
                    <p className="text-2xl font-bold tracking-tight">
                      {vehicle.licensePlate}
                    </p>
                  </div>
                  <ShieldIcon className="w-6 h-6" />
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-blue-200 mb-0.5">Disc No.</p>
                    <p className="font-mono font-medium">
                      {application.discNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-200 mb-0.5">Valid Until</p>
                    <p className="font-medium">
                      {formatDate(application.validUntil!)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
              variant="secondary"
              onClick={handleDownloadDisc}
              leftIcon={<DownloadIcon className="w-4 h-4" />}
              className="flex-1">
              
                Download
              </Button>
              <Button
              variant="primary"
              onClick={handleClose}
              className="flex-1">
              
                Done
              </Button>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </Modal>);

}
function DetailField({ label, value }: {label: string;value: string;}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
        {value}
      </p>
    </div>);

}
function FeeRow({
  label,
  sublabel,
  amount,
  isWarning





}: {label: string;sublabel: string;amount: number;isWarning?: boolean;}) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <p
          className={`font-medium ${isWarning ? 'text-amber-700 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>
          
          {label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{sublabel}</p>
      </div>
      <span
        className={`font-semibold ${isWarning ? 'text-amber-700 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>
        
        {formatCurrency(amount)}
      </span>
    </div>);

}