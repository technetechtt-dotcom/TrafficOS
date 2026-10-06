import { CrashReport, OwnershipTransfer, ServiceBooking } from '../types';
import { formatCurrency, formatDate } from './formatters';
import { formatDateTime, SERVICE_LABELS } from './natis';

const rule = '------------------------------------------------';
const double = '================================================';

export function buildBookingText(
booking: ServiceBooking,
holder: string,
kind: 'confirmation' | 'cancellation')
: string {
  return [
  double,
  kind === 'confirmation' ?
  '        NaTIS BOOKING CONFIRMATION' :
  '        NaTIS BOOKING CANCELLATION',
  double,
  '',
  `Booking ref    : ${booking.receiptNumber}`,
  `Applicant      : ${holder}`,
  `Service        : ${SERVICE_LABELS[booking.service]}`,
  booking.licenceCode ? `Code           : ${booking.licenceCode}` : '',
  `Centre (DLTC)  : ${booking.centre}`,
  `Appointment    : ${formatDateTime(booking.appointmentAt)}`,
  `Fee paid       : ${formatCurrency(booking.fee)}`,
  kind === 'cancellation' && booking.cancelledAt ?
  `Cancelled on   : ${formatDateTime(booking.cancelledAt)}` :
  '',
  '',
  rule,
  kind === 'confirmation' ?
  'Bring your ID, this confirmation and proof of payment. Arrive 15 minutes early. Missed bookings are forfeited.' :
  'This booking has been cancelled and the slot released. Keep this record as proof of cancellation.',
  double].

  filter(Boolean).
  join('\n');
}

export function buildCrashReportText(report: CrashReport, driver: string): string {
  return [
  double,
  '   ROAD TRAFFIC ACCIDENT REPORT (DAMAGE ONLY)',
  '          Issued via NaTIS Online · RTMC',
  double,
  '',
  `Report number  : ${report.referenceNumber}`,
  `Submitted      : ${formatDateTime(report.submittedAt)}`,
  `Status         : ${report.status === 'recorded' ? 'Recorded on NaTIS' : 'Submitted'}`,
  '',
  rule,
  'INCIDENT',
  rule,
  `Date & time    : ${formatDateTime(report.occurredAt)}`,
  `Location       : ${report.location}`,
  `Description    : ${report.description}`,
  `Photographs    : ${report.photoCount} attached`,
  '',
  rule,
  'DRIVER A (REPORTING)',
  rule,
  `Name           : ${driver}`,
  `Vehicle        : ${report.licensePlate}`,
  '',
  rule,
  'DRIVER B (OTHER PARTY)',
  rule,
  `Name           : ${report.otherParty.name}`,
  `Phone          : ${report.otherParty.phone}`,
  `Vehicle        : ${report.otherParty.licensePlate}`,
  `Insurer        : ${report.otherParty.insurer || 'Not provided'}`,
  report.casNumber ? `SAPS CAS no.   : ${report.casNumber}` : '',
  report.policeStation ? `Police station : ${report.policeStation}` : '',
  '',
  rule,
  'This electronic copy may be submitted to your insurer as',
  'the official accident report for a damage-only collision.',
  double].

  filter(Boolean).
  join('\n');
}

export function buildOwnershipNoticeText(
transfer: OwnershipTransfer,
seller: string)
: string {
  return [
  double,
  '   NOTIFICATION OF CHANGE OF OWNERSHIP (NCO)',
  '          Submitted via NaTIS Online',
  double,
  '',
  `Notice number  : ${transfer.receiptNumber}`,
  `Submitted      : ${formatDateTime(transfer.submittedAt)}`,
  '',
  rule,
  'VEHICLE',
  rule,
  `Registration   : ${transfer.licensePlate}`,
  `Description    : ${transfer.vehicleLabel}`,
  `Odometer       : ${transfer.odometer.toLocaleString('en-ZA')} km`,
  `Date of sale   : ${formatDate(transfer.saleDate)}`,
  '',
  rule,
  'SELLER (CURRENT TITLE HOLDER)',
  rule,
  `Name           : ${seller}`,
  '',
  rule,
  'BUYER (NEW OWNER)',
  rule,
  `Name           : ${transfer.buyerName}`,
  `ID number      : ${transfer.buyerIdNumber.slice(0, 6)}*******`,
  '',
  rule,
  'The seller is released from liability for infringements',
  'committed with this vehicle after the date of sale. The',
  'buyer must register the vehicle within 21 days.',
  double].
  join('\n');
}