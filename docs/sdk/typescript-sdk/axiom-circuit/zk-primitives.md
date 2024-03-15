---
description: ZK primitives validated directly in the client circuit
sidebar_position: 2
sidebar_label: ZK Primitives
---

# ZK Primitives

You can use these primitives independently or to do computation on top of the results returned from [Axiom Subqueries](/sdk/typescript-sdk/axiom-circuit/axiom-subqueries). The computations implemented by ZK primitives are proven directly when you run your client circuit.

```typescript
/**
 * Adds two circuit values.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @returns The sum of the two circuit values.
 */
add: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => CircuitValue;

/**
 * Subtracts the second circuit value from the first circuit value.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @returns The difference between the two circuit values.
 */
sub: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => CircuitValue;

/**
 * Negates a circuit value.
 *
 * @param a - The circuit value to negate.
 * @returns The negation of the circuit value.
 */
neg: (a: ConstantValue | CircuitValue) => CircuitValue;

/**
 * Multiplies two circuit values.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @returns The product of the two circuit values.
 */
mul: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => CircuitValue;

/**
 * Multiplies two circuit values and adds a third circuit value.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @param c - The third circuit value.
 * @returns The result of multiplying the first two circuit values and adding the third circuit value.
 */
mulAdd: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue, c: ConstantValue | CircuitValue) => CircuitValue;

/**
 * Multiplies a circuit value by the negation of another circuit value.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @returns The result of multiplying the first circuit value by the negation of the second circuit value.
 */
mulNot: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => CircuitValue;

/**
 * Asserts that a circuit value is a bit.
 *
 * @param a - The circuit value to assert.
 */
assertBit: (a: CircuitValue) => void;

/**
 * Asserts that a circuit value is a constant.
 *
 * @param a - The circuit value to assert.
 * @param b - The raw value to compare to
 */
assertIsConst: (a: CircuitValue, b: ConstantValue) => void;

/**
 * Computes the inner product of two arrays of circuit values.
 *
 * @param a - The first array of circuit values.
 * @param b - The second array of circuit values.
 * @returns The inner product of the two arrays.
 */
innerProduct: (a: (ConstantValue | CircuitValue)[], b: (ConstantValue | CircuitValue)[]) => CircuitValue;

/**
 * Computes the sum of an array of circuit values.
 *
 * @param arr - The array of circuit values.
 * @returns The sum of the array of circuit values.
 */
sum: (arr: (ConstantValue | CircuitValue)[]) => CircuitValue;

/**
 * Performs an AND operation on two circuit values.
 * Assumes the CircuitValues are boolean.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @returns a & b
 */
and: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => CircuitValue;

/**
 * Performs an OR operation on two circuit values.
 * Assumes the CircuitValues are boolean.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @returns a || b
 */
or: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => CircuitValue;

/**
 * Performs a NOT operation on a circuit value.
 *
 * @param a - The boolean circuit value.
 * @returns !a
 */
not: (a: ConstantValue | CircuitValue) => CircuitValue;

/**
 * Decrements a circuit value by 1.
 *
 * @param a - The circuit value.
 * @returns a-1.
 */
dec: (a: ConstantValue | CircuitValue) => CircuitValue;

/**
 * Selects a circuit value based on a condition.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @param c - The condition circuit value.
 * provides the functionality of an if statement `select(a,b,c) = c ? a : b`
 * @returns The selected circuit value, given by c * a + (1 - c) * b
 */
select: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue, c: ConstantValue | CircuitValue) => CircuitValue;

/**
 * Performs a OR-AND operation on three boolean circuit values.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @param c - The third circuit value.
 * @returns a || (b && c)
 */
orAnd: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue, c: ConstantValue | CircuitValue) => CircuitValue;

/**
 * Converts an array of circuit values which are assumed to be bits to an
 * indicator array.  The i_th returned circuit value is 1 if and only if
 * i = (number represented by `bits` in little endian binary), and otherwise
 * it is 0.
 *
 * @param bits - The array of circuit values.
 * @returns The indicator array of circuit values.
 */
bitsToIndicator: (bits: (ConstantValue | CircuitValue)[]) => CircuitValue[];

/**
 * Converts an index circuit value to a length `len` indicator array. The i_th
 * returned circuit value is 1 if and only if i == idx, and otherwise it is 0.
 *
 * @param idx - The index circuit value.
 * @param len - The length of the indicator circuit value.
 * @returns The indicator circuit value.
 */
idxToIndicator: (idx: ConstantValue | CircuitValue, len: ConstantValue) => CircuitValue[];

/**
 * Selects circuit values from an array based on an indicator array of circuit values.
 *
 * @param arr - The array of circuit values.
 * @param indicator - The indicator circuit values.
 * @returns The selected circuit value.
 */
selectByIndicator: (arr: (ConstantValue | CircuitValue)[], indicator: (ConstantValue | CircuitValue)[]) => CircuitValue;

/**
 * Selects a circuit value from an array based on an index circuit value.
 *
 * @param arr - The array of circuit values.
 * @param idx - The index circuit value.
 * @returns The selected circuit value.
 */
selectFromIdx: (arr: (ConstantValue | CircuitValue)[], idx: ConstantValue | CircuitValue) => CircuitValue;

/**
 * Checks if a circuit value is zero.
 *
 * @param a - The circuit value to check.
 * @returns The indicator circuit value representing whether the input is zero.
 */
isZero: (a: ConstantValue | CircuitValue) => CircuitValue;

/**
 * Checks if two circuit values are equal.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @returns The indicator circuit value representing whether the two inputs are equal.
 */
isEqual: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => CircuitValue;

/**
 * Converts a circuit value to an array of bits.
 *
 * @param a - The circuit value to convert.
 * @param len - The length of the resulting bit array.
 * @returns The array of bits representing the input circuit value.
 */
numToBits: (a: ConstantValue | CircuitValue, len: ConstantValue) => CircuitValue[];

/**
 * Asserts that two circuit values are equal.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 */
checkEqual: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => void;

/**
 * Checks if a circuit value is within a specified range.
 *
 * @param a - The circuit value to check.
 * @param b - The range of the circuit value, in number of bits.
 */
rangeCheck: (a: ConstantValue | CircuitValue, b: ConstantValue) => void;

/**
 * Asserts that the first circuit value is less than the second circuit value.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @param c - The bit range of the circuit values. Defaults to 253.
 */
checkLessThan: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue, c?: string) => void;

/**
 * Checks if the first circuit value is less than the second circuit value.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @param c - The bit range of the circuit values. Defaults to 253.
 * @returns 1 if a < b, else 0
 */
isLessThan: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue, c?: string) => CircuitValue;

/**
 * Divides two circuit values and returns the quotient.
 *
 * @param a - The dividend circuit value.
 * @param b - The divisor circuit value.
 * @param c - The bit range of `a`. Defaults to 253 bits.
 * @param d - The bit range of `b`. Defaults to 253 bits.
 * @returns The quotient.
 *
*/
div: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue, c?: string, d?: string) => CircuitValue;

/**
 * Divides two circuit values and returns the remainder.
 *
 * @param a - The dividend circuit value.
 * @param b - The divisor circuit value.
 * @param c - The bit range of `a`. Defaults to 253 bits.
 * @param d - The bit range of `b`. Defaults to 253 bits.
 * @returns The remainder.
 *
*/
mod: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue, c?: string, d?: string) => CircuitValue;

/**
 * Raises a circuit value to the power of another circuit value.
 *
 * @param a - The base circuit value.
 * @param b - The exponent circuit value.
 * @param c - The bit range of b. Defaults to 253 bits.
 * @returns The result of the exponentiation.
 */
pow: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue, c?: string) => CircuitValue;

/**
 * Computes the Poseidon hash of multiple circuit values.
 *
 * @param args - The circuit values to hash.
 * @returns The hash value.
 */
poseidon: (...args: (ConstantValue | CircuitValue)[]) => CircuitValue;
```
