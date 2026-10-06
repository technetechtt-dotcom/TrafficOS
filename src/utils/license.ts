import { Vehicle, LicenseDiscStatus } from '../types';

// Realistic SA license disc fee structure based on tare weight (light passenger vehicles)
export function calculateBaseFee(tareWeight: number): number {
  if (tareWeight <= 250) return 156;
  if (tareWeight <= 500) return 288;
  if (tareWeight <= 750) return 432;
  if (tareWeight <= 1000) return 576;
  if (tareWeight <= 1250) return 696;
  if (tareWeight <= 1500) return 840;
  if (tareWeight <= 1750) return 960;
  if (tareWeight <= 2000) return 1104;
  if (tareWeight <= 2250) return 1224;
  if (tareWeight <= 2500) return 1368;
  return 1512;
}

export const ADMIN_FEE = 72;

export function calculateArrearFee(expiryDate: string): number {
  const now = Date.now();
  const expiry = new Date(expiryDate).getTime();
  const daysOverdue = Math.floor((now - expiry) / (1000 * 60 * 60 * 24));
  if (daysOverdue <= 21) return 0; // 21-day grace period
  // 10% per month overdue
  const monthsOverdue = Math.ceil(daysOverdue / 30);
  return monthsOverdue * 100;
}

export function getDiscStatus(expiryDate?: string): LicenseDiscStatus {
  if (!expiryDate) return 'expired';
  const now = Date.now();
  const expiry = new Date(expiryDate).getTime();
  const daysUntil = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return 'expired';
  if (daysUntil <= 30) return 'expiring';
  return 'valid';
}

export function daysUntilExpiry(expiryDate?: string): number {
  if (!expiryDate) return 0;
  const now = Date.now();
  const expiry = new Date(expiryDate).getTime();
  return Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
}

export function calculateRenewalFees(vehicle: Vehicle) {
  const tareWeight = vehicle.tareWeight || 1000;
  const baseFee = calculateBaseFee(tareWeight);
  const arrearFee = vehicle.licenseDiscExpiry ?
  calculateArrearFee(vehicle.licenseDiscExpiry) :
  0;
  const adminFee = ADMIN_FEE;
  const total = baseFee + arrearFee + adminFee;
  return { baseFee, arrearFee, adminFee, total };
}