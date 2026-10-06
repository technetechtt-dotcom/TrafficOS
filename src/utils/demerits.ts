import { DemeritEvent, DemeritProfile, Fine } from '../types';

/**
 * AARTO demerit point allocation per offence type.
 * Based on the AARTO Act (Act 46 of 1998) Schedule 3 point allocations.
 * Points only attach to offences the driver is held liable for — administrative
 * offences such as an expired disc or parking carry a fine but no points.
 */
const POINTS_BY_OFFENCE: Record<string, number> = {
  Speeding: 2,
  'Excessive Speeding': 6,
  'Red Light Violation': 3,
  'Failure to Stop': 3,
  'Reckless Driving': 6,
  'Negligent Driving': 4,
  'Driving Without a Licence': 4,
  'Mobile Phone Use': 1,
  'Using Mobile Phone': 1,
  'No Seatbelt': 1,
  'Defective Lights': 1,
  'Unroadworthy Vehicle': 2,
  'Illegal Parking': 0,
  'Expired License Disc': 0,
  'Expired Licence Disc': 0,
  Obstruction: 0
};

export const DEMERIT_THRESHOLD = 12;
export const DEMERIT_EXPIRY_YEARS = 3;
export const DEMERIT_REDUCTION_MONTHS = 3;

export function pointsForOffence(offenceType: string): number {
  if (offenceType in POINTS_BY_OFFENCE) return POINTS_BY_OFFENCE[offenceType];
  const key = Object.keys(POINTS_BY_OFFENCE).find((k) =>
  offenceType.toLowerCase().includes(k.toLowerCase())
  );
  return key ? POINTS_BY_OFFENCE[key] : 1;
}

function addYears(iso: string, years: number): string {
  const d = new Date(iso);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString();
}

function addMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

/**
 * Derives the driver's live demerit profile from their actual fine record.
 * A point is incurred once a fine is paid or admitted (pending/overdue fines
 * that are later dismissed never attach). Disputed fines are provisional and
 * excluded until resolved; dismissed fines never attach points.
 */
export function deriveDemeritProfile(fines: Fine[]): DemeritProfile {
  const now = Date.now();

  const events: DemeritEvent[] = fines.
  filter((f) => f.status !== 'dismissed' && f.status !== 'disputed').
  map((fine) => {
    const points = pointsForOffence(fine.offenceType);
    const expiresAt = addYears(fine.issuedDate, DEMERIT_EXPIRY_YEARS);
    return {
      id: `dem_${fine.id}`,
      fineId: fine.id,
      licensePlate: fine.licensePlate,
      offenceType: fine.offenceType,
      points,
      incurredAt: fine.issuedDate,
      expiresAt,
      isActive: new Date(expiresAt).getTime() > now
    };
  }).
  filter((e) => e.points > 0).
  sort(
    (a, b) =>
    new Date(b.incurredAt).getTime() - new Date(a.incurredAt).getTime()
  );

  const activeEvents = events.filter((e) => e.isActive);
  const activePoints = activeEvents.reduce((sum, e) => sum + e.points, 0);

  const nextExpiry =
  [...activeEvents].sort(
    (a, b) =>
    new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
  )[0] ?? null;

  const mostRecent = activeEvents[0];
  const nextReductionDate = mostRecent ?
  addMonths(mostRecent.incurredAt, DEMERIT_REDUCTION_MONTHS) :
  addMonths(new Date().toISOString(), DEMERIT_REDUCTION_MONTHS);

  return {
    activePoints,
    threshold: DEMERIT_THRESHOLD,
    events,
    nextExpiry,
    nextReductionDate,
    suspensionMonths: Math.max(0, activePoints - DEMERIT_THRESHOLD + 1) * 3,
    isSuspended: activePoints >= DEMERIT_THRESHOLD
  };
}

export function demeritLevel(
points: number)
: 'clear' | 'caution' | 'warning' | 'critical' {
  if (points === 0) return 'clear';
  if (points <= 5) return 'caution';
  if (points <= 9) return 'warning';
  return 'critical';
}

export function demeritLevelCopy(level: ReturnType<typeof demeritLevel>): {
  label: string;
  description: string;
} {
  switch (level) {
    case 'clear':
      return {
        label: 'Clear record',
        description:
        'You have no active demerit points. Keep it that way and your licence stays unaffected.'
      };
    case 'caution':
      return {
        label: 'Good standing',
        description:
        'You have points on record but remain well below the suspension threshold.'
      };
    case 'warning':
      return {
        label: 'Approaching threshold',
        description:
        'You are within a few points of suspension. Any further infringement carries real risk.'
      };
    case 'critical':
      return {
        label: 'Suspension risk',
        description:
        'You are at or near 12 points. Reaching the threshold suspends your licence for three months per excess point.'
      };
  }
}