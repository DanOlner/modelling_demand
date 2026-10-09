/**
 * §13: the lenses, every variant of each, for one period. The reporting switches S1 (booking),
 * S2 (public-service output convention) and S3 (measurement view) only change what is
 * reported, so every variant is computed and a view can switch between them without
 * re-running the model.
 */

import type { PeriodRecord } from '../run';
import { accounts, type Accounts } from './accounts';
import { workplaceGva, type WorkplaceGva } from './booking';
import { productChains, type ProductChain } from './chains';
import { placeIncomes, type PlaceIncomes } from './incomes';
import { measurement, type Measurement } from './measurement';
import { producerRectangle, type ProducerRectangle } from './producer';
import { structure, type SectorGroup, type Structure } from './structure';

export interface LensConfig {
  /** Lens 7's sector groups. */
  sectorGroups: SectorGroup[];
}

export interface PeriodLenses {
  /** Lens 1 */
  workplaceGva: WorkplaceGva;
  /** Lenses 2 and 3, one entry per domestic product. */
  chains: ProductChain[];
  /** Lenses 4, 5 and 6 */
  incomes: PlaceIncomes;
  /** Lenses 7 and 8 */
  structure: Structure;
  /** Lens 9 */
  measurement: Measurement;
  /** Lens 10 */
  accounts: Accounts;
  /** Lens 11, one entry per domestic producer. */
  rectangles: ProducerRectangle[];
}

export function periodLenses(record: PeriodRecord, config: LensConfig): PeriodLenses {
  const { econ, result, money } = record;
  return {
    workplaceGva: workplaceGva(econ, result),
    chains: productChains(econ, result),
    incomes: placeIncomes(record),
    structure: structure(econ, result, config.sectorGroups),
    measurement: measurement(record),
    accounts: accounts(econ, result, money),
    rectangles: econ.ids.slice(0, econ.nDomestic).map((id) => producerRectangle(econ, result, id)),
  };
}

export { BOOKINGS, workplaceGva, type Booking, type WorkplaceGva } from './booking';
export { productChains, type ProductChain } from './chains';
export { placeIncomes, wealth, type PlaceIncomes, type Wealth } from './incomes';
export { MEASUREMENT_VIEWS, SERVICE_CONVENTIONS, measurement, type Measurement, type MeasurementView, type ServiceConvention } from './measurement';
export { accounts, type Accounts } from './accounts';
export { isoGvaCurve, producerRectangle, type IsoGvaPoint, type ProducerRectangle } from './producer';
export { localPurchaseShares, localRetention, structure, type SectorGroup, type Structure } from './structure';
export { FLOW_TYPES, GOVERNMENT_NODE, placeFlows, type FlowType, type PlaceFlows } from './flows';
