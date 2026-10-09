/** Display names for places and producers. */

export const PLACE_NAMES: Record<string, string> = {
  C: 'City',
  M: 'Town',
  R: 'Rural area',
  W: 'Rest of the world',
  Government: 'Government',
};

const SECTOR_NAMES: Record<string, string> = {
  HQ: 'Gadget brand',
  BIZ: 'Business services',
  RET: 'Everyday goods and services',
  UTL: 'Utilities and transport',
  PRV: 'Public services',
  HSG: 'Housing',
  CMP: 'Components',
  FOD: 'Food processing',
  AGR: 'Farming',
  GEN: 'Imported goods and energy',
  ASM: 'Contract assembly',
  IP: 'Offshore IP holder',
};

const SHORT_NAMES: Record<string, string> = {
  HQ: 'Gadget',
  BIZ: 'Business services',
  RET: 'Everyday basket',
  UTL: 'Utilities',
  PRV: 'Public services',
  HSG: 'Housing',
  CMP: 'Components',
  FOD: 'Processed food',
  AGR: 'Farm produce',
};

/** A short name for a final product: "Everyday basket, town". */
export function productName(id: string): string {
  const [place, sector] = id.split('.');
  const name = SHORT_NAMES[sector] ?? sector;
  return ['C.HQ', 'C.BIZ', 'M.CMP', 'M.FOD', 'R.AGR'].includes(id) ? name : `${name}, ${PLACE_NAMES[place].toLowerCase()}`;
}

/** "Everyday goods and services, town" */
export function producerName(id: string): string {
  const [place, sector] = id.split('.');
  const name = SECTOR_NAMES[sector] ?? sector;
  return ['C.HQ', 'C.BIZ', 'M.CMP', 'M.FOD', 'R.AGR'].includes(id) || place === 'W' ? name : `${name}, ${PLACE_NAMES[place].toLowerCase()}`;
}
