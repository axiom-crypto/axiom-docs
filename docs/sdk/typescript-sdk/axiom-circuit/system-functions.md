---
description: Commonly used system functions
sidebar_position: 3
sidebar_label: System Functions
---

# System Functions

#### `log`

The `log(...)` function is used to debug the value of a `CircuitValue` or a `CircuitValue256` (or some array of them). This is useful for debugging and checking that the values inside the circuit are what you would expect.

```typescript
/**
 * Logs the provided *circuit* values to the console.
 * Use `console.log` for normal logging.
 *
 * @param args - The values to log (can be `CircuitValue`s or `CircuitValue256`s).
 */
log: (...args: (CircuitValue | CircuitValue256)[]) => void;
```

#### `addToCallback`

This function is used to add a `bytes32` value to the array of results that your callback contract receives upon query fulfillment. You can call `addToCallback` a maximum of 128 times inside a client circuit. See [Smart Contract Integration](/docs/axiom-developer-flow/smart-contract-integration.md "mention") for more info on setting up your contract to receive the the data you pass to `addToCallback`.

```typescript
/**
 * Adds a circuit value to the callback.
 * Values passed to this function will be passed to your
 * callback client contract on-chain by Axiom.
 *
 * @param a - The circuit value to add to the callback.
 */
addToCallback: (a: CircuitValue | CircuitValue256) => void;
```

#### `constant`

This function casts a `ConstantValue` to a `CircuitValue` that must be the same every time you run your circuit.

```typescript
/**
 * Creates a circuit constant from a number, bigint, or string.
 *
 * @param a - The constant value.
 * @returns The constant value cast to CircuitValue.
 */
constant: (a: ConstantValue) => CircuitValue;
```
