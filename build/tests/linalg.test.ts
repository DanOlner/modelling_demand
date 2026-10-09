import { describe, expect, it } from 'vitest';
import {
  identity,
  inverse,
  leontiefInverse,
  luDecompose,
  matMul,
  matVec,
  maxRelativeChange,
  solve,
  subtract,
  vecMat,
} from '../src/engine/linalg';
import { NotBracketedError, brent } from '../src/engine/rootfind';

function expectMatrixClose(actual: number[][], expected: number[][], tolerance = 1e-12) {
  expect(actual.length).toBe(expected.length);
  actual.forEach((row, i) => row.forEach((value, j) => expect(Math.abs(value - expected[i][j])).toBeLessThan(tolerance)));
}

describe('linear algebra', () => {
  it('solves a system that needs pivoting', () => {
    // The first pivot is zero, so this fails without row exchanges.
    const m = [
      [0, 2, 1],
      [1, 1, 1],
      [2, 1, 3],
    ];
    const x = solve(m, [7, 6, 13]);
    expect(x[0]).toBeCloseTo(1, 12);
    expect(x[1]).toBeCloseTo(2, 12);
    expect(x[2]).toBeCloseTo(3, 12);
  });

  it('inverts a matrix', () => {
    const m = [
      [4, 7, 2],
      [3, 6, 1],
      [2, 5, 3],
    ];
    expectMatrixClose(matMul(inverse(m), m), identity(3));
    expectMatrixClose(matMul(m, inverse(m)), identity(3));
  });

  it('computes the Leontief inverse, with L(I − A) = I', () => {
    const a = [
      [0.1, 0.4, 0.0],
      [0.2, 0.0, 0.3],
      [0.05, 0.1, 0.2],
    ];
    const l = leontiefInverse(a);
    expectMatrixClose(matMul(l, subtract(identity(3), a)), identity(3));
    // Every element of a Leontief inverse of a productive economy is non-negative.
    l.forEach((row) => row.forEach((value) => expect(value).toBeGreaterThanOrEqual(0)));
  });

  it('multiplies vectors on either side', () => {
    const m = [
      [1, 2],
      [3, 4],
    ];
    expect(matVec(m, [1, 1])).toEqual([3, 7]);
    expect(vecMat([1, 1], m)).toEqual([4, 6]);
  });

  it('rejects a singular matrix', () => {
    expect(() =>
      luDecompose([
        [1, 2],
        [2, 4],
      ]),
    ).toThrow(/singular/);
  });

  it('measures relative change element by element', () => {
    expect(maxRelativeChange([1, 2, 0], [1, 2, 0])).toBe(0);
    expect(maxRelativeChange([1.1, 2], [1, 2])).toBeCloseTo(0.1 / 1.1, 15);
    expect(maxRelativeChange([NaN], [1])).toBeNaN();
  });
});

describe("Brent's method", () => {
  it('finds a root', () => {
    // The classic test cubic x³ − 2x − 5, whose real root is 2.0945514815423265...
    const root = brent((x) => x ** 3 - 2 * x - 5, 2, 3, { xtol: 1e-15 });
    expect(root).toBeCloseTo(2.0945514815423265, 14);
  });

  it('handles a kinked function, as the calibration can produce', () => {
    const root = brent((x) => Math.max(x, 0) * 3 + x - 1, -1, 1, { xtol: 1e-15 });
    expect(root).toBeCloseTo(0.25, 14);
  });

  it('refuses a range that does not bracket a root', () => {
    expect(() => brent((x) => x * x + 1, -1, 1, { xtol: 1e-12, label: 'test' })).toThrow(NotBracketedError);
  });
});
