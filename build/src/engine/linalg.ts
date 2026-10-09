/**
 * Dense linear algebra for the model's small matrices (about 20 × 20), so the engine
 * needs no numerical library. Matrices are row-major: m[i][j] is row i, column j.
 */

export type Vector = number[];
export type Matrix = number[][];

export function zeros(rows: number, cols: number): Matrix {
  return Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
}

export function filled(length: number, value: number): Vector {
  return new Array<number>(length).fill(value);
}

export function identity(n: number): Matrix {
  const m = zeros(n, n);
  for (let i = 0; i < n; i++) m[i][i] = 1;
  return m;
}

export function transpose(m: Matrix): Matrix {
  const cols = m[0]?.length ?? 0;
  return Array.from({ length: cols }, (_, j) => m.map((row) => row[j]));
}

export function subtract(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => row.map((aij, j) => aij - b[i][j]));
}

export function sum(v: Vector): number {
  let s = 0;
  for (const x of v) s += x;
  return s;
}

/** The matrix–vector product m·v. */
export function matVec(m: Matrix, v: Vector): Vector {
  return m.map((row) => {
    let s = 0;
    for (let j = 0; j < row.length; j++) s += row[j] * v[j];
    return s;
  });
}

/** The row vector v times the matrix m, vᵀm. */
export function vecMat(v: Vector, m: Matrix): Vector {
  const cols = m[0]?.length ?? 0;
  const out = filled(cols, 0);
  for (let i = 0; i < m.length; i++) {
    const vi = v[i];
    if (vi === 0) continue;
    const row = m[i];
    for (let j = 0; j < cols; j++) out[j] += vi * row[j];
  }
  return out;
}

export function matMul(a: Matrix, b: Matrix): Matrix {
  return a.map((row) => vecMat(row, b));
}

/** An LU decomposition with partial pivoting: rows of the original matrix were reordered by `perm`. */
export interface LU {
  lu: Matrix;
  perm: number[];
}

export function luDecompose(m: Matrix): LU {
  const n = m.length;
  const lu = m.map((row) => row.slice());
  const perm = Array.from({ length: n }, (_, i) => i);
  for (let k = 0; k < n; k++) {
    let pivot = k;
    let largest = Math.abs(lu[k][k]);
    for (let i = k + 1; i < n; i++) {
      const size = Math.abs(lu[i][k]);
      if (size > largest) {
        largest = size;
        pivot = i;
      }
    }
    if (largest === 0) throw new Error(`Matrix is singular: column ${k} has no non-zero pivot`);
    if (pivot !== k) {
      [lu[k], lu[pivot]] = [lu[pivot], lu[k]];
      [perm[k], perm[pivot]] = [perm[pivot], perm[k]];
    }
    for (let i = k + 1; i < n; i++) {
      const factor = (lu[i][k] /= lu[k][k]);
      if (factor === 0) continue;
      for (let j = k + 1; j < n; j++) lu[i][j] -= factor * lu[k][j];
    }
  }
  return { lu, perm };
}

export function luSolve({ lu, perm }: LU, b: Vector): Vector {
  const n = lu.length;
  const y = perm.map((p) => b[p]);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) y[i] -= lu[i][j] * y[j];
  }
  for (let i = n - 1; i >= 0; i--) {
    for (let j = i + 1; j < n; j++) y[i] -= lu[i][j] * y[j];
    y[i] /= lu[i][i];
  }
  return y;
}

export function solve(m: Matrix, b: Vector): Vector {
  return luSolve(luDecompose(m), b);
}

export function inverse(m: Matrix): Matrix {
  const n = m.length;
  const lu = luDecompose(m);
  const columns = Array.from({ length: n }, (_, j) => {
    const unit = filled(n, 0);
    unit[j] = 1;
    return luSolve(lu, unit);
  });
  return transpose(columns);
}

/** The Leontief inverse (I − A)⁻¹: column k is the output of every producer needed per unit of final demand for k. */
export function leontiefInverse(a: Matrix): Matrix {
  return inverse(subtract(identity(a.length), a));
}

/**
 * The largest relative change between two vectors, element by element. Elements that are
 * zero in both count as unchanged.
 */
export function maxRelativeChange(next: Vector, prev: Vector): number {
  let worst = 0;
  for (let i = 0; i < next.length; i++) {
    const scale = Math.max(Math.abs(next[i]), Math.abs(prev[i]));
    if (scale === 0) continue;
    const change = Math.abs(next[i] - prev[i]) / scale;
    if (!(change <= worst)) worst = change; // also catches NaN
  }
  return worst;
}
