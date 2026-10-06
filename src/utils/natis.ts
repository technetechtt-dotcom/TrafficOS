import {
  Address,
  BookingService,
  Delivery,
  DeliveryItem,
  DeliveryMethod,
  DeliveryStatus,
  SlotService } from
'../types';

/**
 * Official fees from the RTMC Act regulations (Schedule 2) plus typical
 * Gauteng DLTC tariffs for tests. Provincial test fees vary slightly.
 */
export const NATIS_FEES = {
  onlineBookingFee: 22,
  cardDelivery: 99,
  ownershipNotification: 530,
  crashReportCopy: 60,
  learnerTest: 108,
  drivingTest: 228,
  prdpApplication: 250
};

export interface DeliveryOption {
  id: DeliveryMethod;
  label: string;
  description: string;
  fee: number;
  workingDays: number;
}

export const DISC_DELIVERY_OPTIONS: DeliveryOption[] = [
{
  id: 'collect',
  label: 'Collect at licensing office',
  description: 'Ready the next working day',
  fee: 0,
  workingDays: 1
},
{
  id: 'ordinary',
  label: 'Ordinary mail',
  description: 'SAPO · 7–10 working days · untracked',
  fee: 28,
  workingDays: 10
},
{
  id: 'registered',
  label: 'Registered mail',
  description: 'SAPO · 3–5 working days · tracked',
  fee: 72,
  workingDays: 5
},
{
  id: 'courier',
  label: 'Courier to your door',
  description: 'The Courier Guy · 2–3 working days · tracked',
  fee: 99,
  workingDays: 3
}];


export const DELIVERY_STAGES: DeliveryStatus[] = [
'processing',
'dispatched',
'in-transit',
'out-for-delivery',
'delivered'];


export const DELIVERY_STAGE_COPY: Record<
  DeliveryStatus,
  {label: string;note: string;}> =
{
  processing: {
    label: 'Processing',
    note: 'Printed and being packed by the licensing authority.'
  },
  dispatched: {
    label: 'Dispatched',
    note: 'Handed to the carrier.'
  },
  'in-transit': {
    label: 'In transit',
    note: 'Moving through the carrier network to your area.'
  },
  'out-for-delivery': {
    label: 'Out for delivery',
    note: 'With the driver — expect it today.'
  },
  delivered: {
    label: 'Delivered',
    note: 'Signed for at your address.'
  }
};

export const SERVICE_LABELS: Record<BookingService, string> = {
  'learner-test': "Learner's licence test",
  'driving-test': 'Driving licence test',
  prdp: 'Professional Driving Permit',
  'licence-renewal': 'Driving licence card renewal'
};

export const SLOT_SERVICE_LABELS: Record<SlotService, string> = {
  'licence-renewal': 'Driving licence card renewal',
  prdp: 'PrDP application'
};

export function addWorkingDays(from: Date, days: number): Date {
  const date = new Date(from);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  return date;
}

export function generateReference(prefix: string): string {
  const rand = Math.floor(Math.random() * 90000000 + 10000000);
  return `${prefix}${rand}`;
}

export function formatAddress(address: Address): string {
  return [
  address.street,
  address.suburb,
  address.city,
  address.postalCode].

  filter(Boolean).
  join(', ');
}

export function createDelivery(params: {
  item: DeliveryItem;
  label: string;
  reference: string;
  method: Exclude<DeliveryMethod, 'collect'>;
  fee: number;
  address: Address;
  vehicleId?: string;
}): Delivery {
  const option = DISC_DELIVERY_OPTIONS.find((o) => o.id === params.method);
  const now = new Date();
  const isCourier = params.method === 'courier';
  return {
    id: `del_${Date.now()}`,
    ...params,
    carrier: isCourier ? 'The Courier Guy' : 'SA Post Office',
    trackingNumber: isCourier ?
    generateReference('TCG') :
    `RR${Math.floor(Math.random() * 900000000 + 100000000)}ZA`,
    status: 'processing',
    createdAt: now.toISOString(),
    estimatedDelivery: addWorkingDays(
      now,
      option?.workingDays ?? 5
    ).toISOString(),
    events: [
    {
      status: 'processing',
      timestamp: now.toISOString(),
      note: DELIVERY_STAGE_COPY.processing.note
    }]

  };
}

/** Hours and minutes left before a slot offer lapses. */
export function timeLeft(iso: string): {
  hours: number;
  minutes: number;
  expired: boolean;
  fraction: number;
} {
  const ms = new Date(iso).getTime() - Date.now();
  const total = 24 * 3600000;
  if (ms <= 0) return { hours: 0, minutes: 0, expired: true, fraction: 0 };
  return {
    hours: Math.floor(ms / 3600000),
    minutes: Math.floor(ms % 3600000 / 60000),
    expired: false,
    fraction: Math.min(1, ms / total)
  };
}

/** Validates an SA ID number's length and Luhn check digit. */
export function isValidSaId(id: string): boolean {
  if (!/^\d{13}$/.test(id)) return false;
  const digits = id.split('').map(Number);
  const check = digits.pop() as number;
  let sum = 0;
  digits.reverse().forEach((digit, index) => {
    if (index % 2 === 0) {
      const doubled = digit * 2;
      sum += doubled > 9 ? doubled - 9 : doubled;
    } else {
      sum += digit;
    }
  });
  return (10 - sum % 10) % 10 === check;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-ZA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}