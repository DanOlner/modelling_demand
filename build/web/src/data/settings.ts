/**
 * The reporting switches, and the streetlight rules (views plan 8.3). In the official view the
 * switches are fixed at what UK statistics do: wage-bill allocation of multi-place firms' profit
 * (ONS documents it for finance and insurance only, so this is stylised), sector deflators, and
 * public services measured by output indicators.
 */

import type { Booking, MeasurementView, ServiceConvention } from '../../../src/engine/lenses';

export type Mode = 'official' | 'true';

export interface Switches {
  booking: Booking;
  measure: MeasurementView;
  convention: ServiceConvention;
}

export const OFFICIAL_SWITCHES: Switches = { booking: 'wageBill', measure: 'sectorDeflated', convention: 'indicator' };

/** The switches in force: the user's in the true-flows view, the official ones in the official view. */
export function effectiveSwitches(mode: Mode, chosen: Switches): Switches {
  return mode === 'official' ? OFFICIAL_SWITCHES : chosen;
}

export const BOOKING_LABELS: Record<Booking, string> = {
  true: 'Where produced (true)',
  headOffice: 'At head office',
  wageBill: 'By wage bill (ONS-style)',
};
export const MEASURE_LABELS: Record<MeasurementView, string> = {
  nominal: 'Nominal',
  ownPrice: 'Real, own base prices',
  sectorDeflated: 'Real, sector deflators (official)',
};
export const CONVENTION_LABELS: Record<ServiceConvention, string> = {
  input: 'By inputs',
  indicator: 'By output indicators',
};
