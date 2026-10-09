/**
 * Brent's method for a root of f between lo and hi, where f(lo) and f(hi) have opposite
 * signs. It keeps the root bracketed at every step, so it is as safe as bisection, but it
 * uses secant and inverse-quadratic steps where they help, so it is usually much faster.
 * Follows `zbrent` in Press et al., Numerical Recipes.
 */

export class NotBracketedError extends Error {
  constructor(
    message: string,
    readonly fLo: number,
    readonly fHi: number,
  ) {
    super(message);
    this.name = 'NotBracketedError';
  }
}

export interface BrentOptions {
  /** Absolute tolerance on the root. */
  xtol: number;
  maxIterations?: number;
  /** Names the unknown in error messages. */
  label?: string;
}

export function brent(f: (x: number) => number, lo: number, hi: number, options: BrentOptions): number {
  const { xtol, maxIterations = 200, label = 'root' } = options;
  let a = lo;
  let b = hi;
  let fa = f(a);
  let fb = f(b);
  if (fa === 0) return a;
  if (fb === 0) return b;
  if (Math.sign(fa) === Math.sign(fb) || Number.isNaN(fa) || Number.isNaN(fb)) {
    throw new NotBracketedError(
      `${label} is not bracketed: f(${lo}) = ${fa} and f(${hi}) = ${fb} have the same sign`,
      fa,
      fb,
    );
  }
  let c = a;
  let fc = fa;
  let d = b - a;
  let e = d;
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    if (Math.sign(fb) === Math.sign(fc)) {
      c = a;
      fc = fa;
      d = b - a;
      e = d;
    }
    if (Math.abs(fc) < Math.abs(fb)) {
      a = b;
      b = c;
      c = a;
      fa = fb;
      fb = fc;
      fc = fa;
    }
    const tol = 2 * Number.EPSILON * Math.abs(b) + 0.5 * xtol;
    const half = 0.5 * (c - b);
    if (Math.abs(half) <= tol || fb === 0) return b;
    if (Math.abs(e) >= tol && Math.abs(fa) > Math.abs(fb)) {
      // Try interpolation: secant if only two points are distinct, else inverse quadratic.
      const s = fb / fa;
      let p: number;
      let q: number;
      if (a === c) {
        p = 2 * half * s;
        q = 1 - s;
      } else {
        const qa = fa / fc;
        const r = fb / fc;
        p = s * (2 * half * qa * (qa - r) - (b - a) * (r - 1));
        q = (qa - 1) * (r - 1) * (s - 1);
      }
      if (p > 0) q = -q;
      p = Math.abs(p);
      if (2 * p < Math.min(3 * half * q - Math.abs(tol * q), Math.abs(e * q))) {
        e = d;
        d = p / q;
      } else {
        d = half;
        e = d;
      }
    } else {
      d = half;
      e = d;
    }
    a = b;
    fa = fb;
    b += Math.abs(d) > tol ? d : half >= 0 ? tol : -tol;
    fb = f(b);
  }
  throw new Error(`${label}: Brent's method did not converge in ${maxIterations} iterations`);
}
