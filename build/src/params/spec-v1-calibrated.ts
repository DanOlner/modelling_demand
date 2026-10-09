import { baseFingerprint, withCalibration } from '../engine/calibrate';
import type { Params } from '../engine/types';
import { specV1Base } from './spec-v1';
import { specV1Calibration } from './spec-v1.calibration';

/**
 * The spec economy with its stored base-year calibration (§12: "store the solved X, θ and
 * s_C with the defaults"). Fails if the base parameters have changed since it was made.
 */
export function specV1(): Params {
  const base = specV1Base();
  if (baseFingerprint(base) !== specV1Calibration.fingerprint) {
    throw new Error('The base parameters have changed since the stored calibration was made: run `npm run calibrate`');
  }
  return withCalibration(base, specV1Calibration);
}
