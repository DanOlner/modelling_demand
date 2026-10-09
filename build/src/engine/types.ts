/**
 * Parameter types. A parameter set is plain JSON-compatible data, so a scenario can change
 * any value by its path, and the browser views can load, edit and save parameter sets.
 * Section numbers (§) refer to /notes/model-spec-v1.md.
 */

export type PlaceId = string;
export type ProducerId = string;
export type FirmId = string;
/** A domestic place or the rest of the world, as a group that receives dividends. */
export type OwnerGroup = string;

/** §6: how a producer sets its price. */
export type PricingRule = 'markup' | 'cost' | 'fixed';

export interface ProducerParams {
  /** A domestic place, or the rest-of-world label for foreign suppliers. */
  place: PlaceId;
  /** Sector code such as 'RET'. A producer's ID is `${place}.${sector}`. */
  sector: string;
  description: string;
  /** The firm that owns this producer; null for rest-of-world suppliers. */
  firm: FirmId | null;
  pricing: PricingRule;
  /** μ_j: markup on prime cost (bought-in inputs plus direct labour), for 'markup' pricing. */
  markup: number;
  /** p̄_j: the price index under 'fixed' pricing; 1 in the base year. */
  fixedPrice: number;
  /** a_ij: units of producer i's output used per unit of this producer's output. */
  inputs: Record<ProducerId, number>;
  /** ℓ_j: jobs per unit of output, i.e. per £1 of output at base prices. */
  jobsPerUnit: number;
  /** ω_j: annual wage per job, £. */
  wagePerJob: number;
  /** δ_j: depreciation per unit of output, £ at base prices. Not revalued in v1. */
  depreciation: number;
  /** ρ_j: share of after-tax profit paid out as dividends. */
  payout: number;
  /** π⁰_j: base-year price of one physical unit, £, used by the single-producer view. */
  displayPrice: number;
  displayUnit: string;
}

export interface FirmParams {
  description: string;
  /** The place of the firm's head office; null for the government. */
  headOffice: PlaceId | null;
  /** s_{f,o}: each owner group's share of the firm's dividends. Sums to 1, except for the government. */
  owners: Record<OwnerGroup, number>;
  /** A public body: it pays no profit tax, and any surplus goes to the government. */
  government: boolean;
}

export interface DemographyParams {
  workingAgeShare: number;
  /** Participation rate among the working-age population. */
  participation: number;
  personsPerDwelling: number;
}

export interface CalibrationSettings {
  /** §12: the base-year targets. */
  targets: {
    currentAccount: number;
    unemploymentRate: number;
    /** Share of the main place's jobs held by in-commuters. */
    mainPlaceInCommuting: number;
  };
  /** §12: search ranges for the main place's population share s_C and the income tax rate θ. */
  mainShareRange: [number, number];
  incomeTaxRateRange: [number, number];
}

/** §12: base-year results to report against an expected range. */
export type PlausibilityCheck =
  | {
      label: string;
      metric:
        | 'incomeTaxRate'
        | 'mainShare'
        | 'gdpPerResident'
        | 'disposableIncomeToGdp'
        | 'labourShareOfGva'
        | 'exportsToGdp'
        | 'overseasDividendsToGdp';
      min: number;
      max: number;
    }
  | { label: string; metric: 'sectorShareOfGva'; sector: string; min: number; max: number }
  | { label: string; metric: 'producerShareOfGdp'; producer: ProducerId; min: number; max: number }
  | { label: string; metric: 'mainPlaceHasHighestGvaPerJob' };

export interface Params {
  name: string;
  /** Domestic places, in display order. */
  places: PlaceId[];
  /** The rest of the world's label: the place of foreign suppliers, and an owner group. */
  restOfWorld: PlaceId;
  population: {
    total: number;
    /** The place whose population share is set by calibration: the city. */
    mainPlace: PlaceId;
    /** s_C, set by calibration. */
    mainShare: number;
    /** How the rest of the population splits between the other places, as relative weights. */
    otherWeights: Record<PlaceId, number>;
  };
  demography: Record<PlaceId, DemographyParams>;
  producers: Record<ProducerId, ProducerParams>;
  firms: Record<FirmId, FirmParams>;
  households: {
    /** α₁ and α₂: spending out of disposable income and out of last period's money (after the base year). */
    alpha1: number;
    alpha2: number;
    /** Essential quantities per resident, by sector (bought from the local producer) and place. */
    essentialsPerResident: Record<string, Record<PlaceId, number>>;
    /** s_g: share of discretionary spending that goes on the gadget producer. */
    gadgetShare: number;
    gadgetProducer: ProducerId;
    /** The rest of discretionary spending goes on the local producer of this sector. */
    localSector: string;
    /** S15, a test mode: hold each household's quantity of every good at its base-year level. */
    freezeConsumption: boolean;
  };
  government: {
    /** θ, set by calibration. */
    incomeTaxRate: number;
    /** τ, charged on positive net profit. */
    profitTaxRate: number;
    /** b_n: £ a year per non-working-age resident. */
    benefitNonWorking: number;
    /** b_u: £ a year per unemployed person. */
    benefitUnemployed: number;
    /** The government buys public services from the local producer of this sector. */
    provisionSector: string;
    /** g: units of public services bought per resident. */
    provisionPerResident: number;
    /** S8: a multiplier on g, by place. */
    provisionMultiplier: Record<PlaceId, number>;
    /** q_r: quality index of public services, by place. It affects measurement only. */
    quality: Record<PlaceId, number>;
  };
  investment: {
    /** Replacement investment, equal to total depreciation, is spent in these shares. */
    shares: Record<ProducerId, number>;
  };
  exports: {
    /** X: total exports at base prices, set by calibration. */
    total: number;
    /** Export quantity per unit of X, by producer: the export mix. */
    mix: Record<ProducerId, number>;
  };
  royalty: {
    /** The producer that pays a royalty on its revenue to the offshore IP holder; null if none. */
    payer: ProducerId | null;
    /** r_IP: the royalty as a share of the payer's revenue. 0 means the Cupertino switch is off. */
    rate: number;
    /** ρ_IP: share of royalties the IP holder pays out as dividends. */
    payout: number;
    /** The IP holder pays its dividends to this firm's owners, in their shares. */
    ownerFirm: FirmId | null;
  };
  commuting: {
    /**
     * S10: a commuting matrix Γ to use instead of the base-year one (rows are workplaces,
     * columns places of residence, each row summing to 1); null keeps the base-year matrix.
     */
    override: number[][] | null;
  };
  /** §10: the wealth lens. */
  wealth: {
    housingSector: string | null;
    /** y_h: rents are capitalised at this yield. */
    housingYield: number;
    /** y_e: after-tax profits are capitalised at this yield. */
    equityYield: number;
    /** Firms left out of equity wealth because housing wealth already counts them. */
    excludeFromEquity: FirmId[];
  };
  /** Null for economies that aren't calibrated, such as the T8 test economy. */
  calibration: CalibrationSettings | null;
  plausibility: PlausibilityCheck[];
}
