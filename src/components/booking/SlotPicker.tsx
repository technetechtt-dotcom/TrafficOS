import React, { useMemo } from 'react';
import { MapPinIcon } from 'lucide-react';
import {
  appointmentTimes,
  testingCentres,
  TestingCentre } from
'../../data/natisServices';

interface SlotPickerProps {
  centreId: string;
  date: string | null;
  time: string | null;
  onChange: (next: {
    centreId: string;
    date: string | null;
    time: string | null;
  }) => void;
}

/** Local YYYY-MM-DD key so dates compare without timezone drift. */
function dateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function getAvailableDates(centre: TestingCentre, count = 8): Date[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + centre.nextSlot);
  const dates: Date[] = [];
  const cursor = new Date(start);
  while (dates.length < count) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function toAppointmentIso(date: string, time: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm).toISOString();
}

/** Deterministic "fully booked" pattern so the grid feels like real demand. */
function isFull(dateIndex: number, timeIndex: number): boolean {
  return (dateIndex * 3 + timeIndex) % 5 === 0;
}

export function SlotPicker({ centreId, date, time, onChange }: SlotPickerProps) {
  const centre =
  testingCentres.find((c) => c.id === centreId) ?? testingCentres[0];
  const dates = useMemo(() => getAvailableDates(centre), [centre]);
  const dateIndex = dates.findIndex((d) => dateKey(d) === date);

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Testing centre
        </legend>
        <div className="space-y-2">
          {testingCentres.map((c) => {
            const isSelected = c.id === centre.id;
            return (
              <button
                type="button"
                key={c.id}
                aria-pressed={isSelected}
                onClick={() =>
                onChange({ centreId: c.id, date: null, time: null })
                }
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                isSelected ?
                'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500' :
                'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`
                }>
                
                <MapPinIcon
                  className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-gray-900 dark:text-white truncate">
                    {c.name}
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    {c.area}
                  </span>
                </span>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                  {c.nextSlot}d wait
                </span>
              </button>);

          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Date
        </legend>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {dates.map((d) => {
            const key = dateKey(d);
            const isSelected = key === date;
            return (
              <button
                type="button"
                key={key}
                aria-pressed={isSelected}
                onClick={() =>
                onChange({ centreId: centre.id, date: key, time: null })
                }
                className={`flex-shrink-0 w-16 py-2.5 rounded-xl border text-center transition-colors ${
                isSelected ?
                'border-blue-600 bg-blue-600 text-white' :
                'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'}`
                }>
                
                <span
                  className={`block text-[11px] font-medium ${isSelected ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                  
                  {d.toLocaleDateString('en-ZA', { weekday: 'short' })}
                </span>
                <span className="block text-lg font-bold leading-tight">
                  {d.getDate()}
                </span>
                <span
                  className={`block text-[11px] ${isSelected ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                  
                  {d.toLocaleDateString('en-ZA', { month: 'short' })}
                </span>
              </button>);

          })}
        </div>
      </fieldset>

      {date &&
      <fieldset>
          <legend className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Time
          </legend>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {appointmentTimes.map((t, timeIndex) => {
            const full = isFull(dateIndex, timeIndex);
            const isSelected = t === time;
            return (
              <button
                type="button"
                key={t}
                disabled={full}
                aria-pressed={isSelected}
                onClick={() =>
                onChange({ centreId: centre.id, date, time: t })
                }
                className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                full ?
                'border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-600 line-through cursor-not-allowed' :
                isSelected ?
                'border-blue-600 bg-blue-600 text-white' :
                'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'}`
                }>
                
                  {t}
                </button>);

          })}
          </div>
        </fieldset>
      }
    </div>);

}