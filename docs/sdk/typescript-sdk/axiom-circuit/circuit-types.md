---
sidebar_position: 1
sidebar_label: Data Types for Circuits
---

# Data Types for Circuits

In an Axiom client circuit, it is important to distinguish between values that should be constant in the circuit regardless of what inputs it is given, and values that are variable and depend on the inputs to the circuit. We use different data types to distinguish these notions. In particular we have the primitive types `ConstantValue`, `CircuitValue`, and `CircuitValue256`. All circuit inputs must be built from `CircuitValue` and `CircuitValue256` types to delineate that they are variable and may change with each new proof.

## Constant Data Types

```typescript
export type ConstantValue = string | number | bigint;
```

Circuit functions can take in the `ConstantValue` type. These values are inferred to be fixed and immutable in your circuit. You should use `ConstantValue` types when the value should **not change** based on the inputs to your circuit.

:::info
In some editors, IntelliSense will show `RawCircuitInput` in function signatures. This is an internal type alias that is **the same** as `ConstantValue`.
:::

## Circuit Data Types

There are two protected classes to represent variable values inside a circuit: `CircuitValue` and `CircuitValue256`.

Due to some specifics of our ZK proving system, a `CircuitValue` represents variable values that can be at most **253** bits. Since EVM slots are 256 bits, we've created a `CircuitValue256` class that represents 256 bit values in `hi`-`lo` form (`hi` is the most significant 128 bits, `lo` is the 128 least significant bits).

### `CircuitValue`

Here are the methods available on a `CircuitValue` object:

```typescript
class CircuitValue {
  // converts the CircuitValue to a CircuitValue256 inside the circuit
  toCircuitValue256(): CircuitValue256;

  // returns the value as a bigint
  value(): bigint;

  // returns the value as a number
  number(): number;

  // returns the value as an address string
  address(): string;
}
```

The `toCircuitValue256()` function can be used to convert the object from `CircuitValue` type to `CircuitValue256` type:

- `toCircuitValue256()` -- constructs a new `CircuitValue256` object where the lo field is the original `CircuitValue` and the hi field is loaded as a constant `0`.

If necessary, you can cast from `ConstantValue` to `CircuitValue` by using the [`constant()`](./system-functions.md#constant) function.

:::warning
The functions `value(), number(), address()` should only be used for logging/debugging purposes and should **not** be used in any ZK primitives or Axiom subqueries.

- `value()` -- returns the internal value as a bigint
- `number()` -- tries to cast the internal value to `Number` and returns it. Will throw an error if the value is too large to fit in a `Number`.
- `address()` -- converts the internal value to a hex string starting with `0x` representing 20 bytes exactly. Will left pad with zeros if the value is less than 20 bytes. Will truncate if the value is greater than 20 bytes.
  :::

### `CircuitValue256`

Since EVM slots are 256 bits, we've created a `CircuitValue256` class that represents 256 bit values in `hi`-`lo` form (`hi` is the most significant 128 bits, `lo` is the 128 least significant bits).

Here are the methods available on a `CircuitValue256` object.

```typescript
class CircuitValue256 {
  // returns the `hi` CircuitValue
  hi(): CircuitValue;

  // returns the `lo` CircuitValue
  lo(): CircuitValue;

  // constrains that the CircuitValue256 can fit in 253 bits
  // and constrains out = 2**128 * hi + lo
  toCircuitValue(): CircuitValue;

  // returns the value as a bigint
  value(): bigint;

  // returns the value as a hex string
  hex(): string;
}
```

We have the following functions that return `CircuitValue`:

- `hi()` -- returns the `hi` field of the `CircuitValue256` object, where `hi` refers to the most significant 128 bits of the value.
- `lo()` -- returns the `lo` field of the `CircuitValue256` object, where `lo` refers to the least significant 128 bits of the value.
- `toCircuitValue()` -- uses ZK primitives to constrain that the `CircuitValue256` has at most 253 bits and then computes and returns `2**128 * hi + lo` as a `CircuitValue`.

By default all Axiom Subqueries return a `CircuitValue256`. To use these results in other ZK primitives that take `CircuitValue`s, you must call `.toCircuitValue()`. If you know that the data you are querying is less than 253 bits (ie. block number, address, uint128, etc.), this is totally safe. For values which may overflow 253 bits (such as storage slots, bytes32), your proof will fail to verify if the value actually overflows (in particular, if the hi `CircuitValue` exceeds 125 bits).

:::warning
The functions `value(), hex()` should only be used for logging/debugging purposes and should **not** be used in any ZK primitives or Axiom subqueries.

- `value()` -- returns the internal value as a bigint
- `hex()` -- returns the internal value as a hex string starting with `0x` representing 32 bytes exactly. Will left pad with zeros if the value is less than 32 bytes.
  :::
