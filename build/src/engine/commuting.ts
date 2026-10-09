/**
 * §9: commuting. Γ[w][r] is the share of jobs in place w held by residents of place r, so
 * each row sums to 1. Commuters earn the same as local workers.
 */

import { sum, zeros, type Matrix, type Vector } from './linalg';

/**
 * The base-year commuting rule, used only in period 0:
 * 1. every place gets the same employment rate: target employed residents E*_r = LF_r · ΣJ / ΣLF;
 * 2. local jobs are filled first: L_rr = min(J_r, E*_r);
 * 3. surplus residents S_r = E*_r − L_rr; unfilled jobs D_w = J_w − L_ww;
 * 4. surplus residents fill unfilled jobs elsewhere in proportion to the gaps: F_rw = S_r · D_w / ΣD;
 * 5. so Γ_ww = L_ww / J_w and Γ_wr = F_rw / J_w for r ≠ w.
 */
export function baseYearCommuting(jobs: Vector, labourForce: Vector): Matrix {
  const n = jobs.length;
  const totalJobs = sum(jobs);
  const totalLabourForce = sum(labourForce);
  const target = labourForce.map((lf) => (lf * totalJobs) / totalLabourForce);
  const local = jobs.map((j, r) => Math.min(j, target[r]));
  const surplus = target.map((t, r) => t - local[r]);
  const unfilled = jobs.map((j, w) => j - local[w]);
  const totalUnfilled = sum(unfilled);
  const gamma = zeros(n, n);
  for (let w = 0; w < n; w++) {
    if (jobs[w] === 0) {
      gamma[w][w] = 1;
      continue;
    }
    gamma[w][w] = local[w] / jobs[w];
    if (totalUnfilled === 0) continue;
    for (let r = 0; r < n; r++) {
      if (r !== w) gamma[w][r] = (surplus[r] * unfilled[w]) / totalUnfilled / jobs[w];
    }
  }
  return gamma;
}

/** In-commuters to place w as a share of the jobs there. */
export function inCommutingShare(gamma: Matrix, w: number): number {
  return 1 - gamma[w][w];
}
