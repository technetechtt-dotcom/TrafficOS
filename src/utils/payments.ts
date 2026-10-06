import { Fine, PaymentMethod, PaymentRecord } from '../types';
import { formatCurrency, formatDate } from './formatters';

/**
 * AARTO allows a 50% discount on the penalty where the infringement notice is
 * paid within 32 days of service. After that window the full amount is due, and
 * once the courtesy letter stage is reached a further fee applies.
 */
export const EARLY_PAYMENT_WINDOW_DAYS = 32;
export const EARLY_PAYMENT_DISCOUNT_RATE = 0.5;
export const COURTESY_LETTER_FEE = 200;
export const SERVICE_FEE = 15;

export interface FeeBreakdown {
  subtotal: number;
  discount: number;
  discountLabel: string | null;
  courtesyFee: number;
  serviceFee: number;
  total: number;
  daysRemaining: number;
  isDiscountEligible: boolean;
  isOverdue: boolean;
}

export function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

export function calculateFineFees(fine: Fine): FeeBreakdown {
  const elapsed = daysSince(fine.issuedDate);
  const daysRemaining = EARLY_PAYMENT_WINDOW_DAYS - elapsed;
  const isDiscountEligible = daysRemaining > 0;
  const isOverdue = daysUntil(fine.dueDate) < 0;

  const discount = isDiscountEligible ?
  Math.round(fine.amount * EARLY_PAYMENT_DISCOUNT_RATE) :
  0;
  const courtesyFee = isOverdue ? COURTESY_LETTER_FEE : 0;
  const total = fine.amount - discount + courtesyFee + SERVICE_FEE;

  return {
    subtotal: fine.amount,
    discount,
    discountLabel: isDiscountEligible ?
    `AARTO early-payment discount (50%) — ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left` :
    null,
    courtesyFee,
    serviceFee: SERVICE_FEE,
    total,
    daysRemaining,
    isDiscountEligible,
    isOverdue
  };
}

export const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  description: string;
}[] = [
{
  id: 'card',
  label: 'Debit / Credit Card',
  description: 'Visa, Mastercard · 3D Secure'
},
{
  id: 'instant-eft',
  label: 'Instant EFT',
  description: 'Pay directly from your bank account'
},
{
  id: 'ozow',
  label: 'Ozow',
  description: 'Instant bank-to-bank, no card needed'
},
{
  id: 'snapscan',
  label: 'SnapScan',
  description: 'Scan the QR code with your SnapScan app'
},
{
  id: 'payfast',
  label: 'PayFast',
  description: 'Card, EFT, Mobicred and more'
}];


export function methodLabel(method: PaymentMethod): string {
  return PAYMENT_METHODS.find((m) => m.id === method)?.label ?? method;
}

export function generateReceiptNumber(prefix = 'RCP'): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `${prefix}-${stamp}-${rand}`;
}

/**
 * Builds a plain-text receipt suitable for download. Mirrors the layout of an
 * official municipal receipt so it reads as a genuine proof of payment.
 */
export function buildReceiptText(
record: PaymentRecord,
payerName: string)
: string {
  const lines = [
  '================================================',
  '            TRAFFICOS SA — TAX INVOICE',
  '              PROOF OF PAYMENT',
  '================================================',
  '',
  `Receipt number : ${record.receiptNumber}`,
  `Date paid      : ${formatDate(record.paidAt)}`,
  `Paid by        : ${payerName}`,
  `Payment method : ${methodLabel(record.method)} (${record.methodDetail})`,
  record.authority ? `Authority      : ${record.authority}` : '',
  '',
  '------------------------------------------------',
  'DESCRIPTION',
  '------------------------------------------------',
  record.description,
  `Reference      : ${record.reference}`,
  '',
  '------------------------------------------------',
  'AMOUNT',
  '------------------------------------------------',
  `Subtotal              ${formatCurrency(record.subtotal)}`,
  record.discount > 0 ?
  `Early-payment disc.  -${formatCurrency(record.discount)}` :
  '',
  record.serviceFee > 0 ?
  `Service fee           ${formatCurrency(record.serviceFee)}` :
  '',
  `TOTAL PAID            ${formatCurrency(record.total)}`,
  '',
  '------------------------------------------------',
  'This receipt serves as proof of settlement of the',
  'above infringement or licence fee. Retain it for',
  'your records. Issued electronically in terms of',
  'the Electronic Communications and Transactions',
  'Act 25 of 2002.',
  '================================================'];

  return lines.filter(Boolean).join('\n');
}

export function downloadTextFile(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}