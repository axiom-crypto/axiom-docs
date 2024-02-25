---
description: axiom-std versions
sidebar_position: 3
sidebar_label: axiom-std
---

# axiom-std

## v0.1.4 (e10e6e3)

- Move `caller` to `query` from `prankFulfill`
- Capture stdout and stderr from FFI commands to display legibly in Foundry logs
- Make functions in `Axiom` library `public` to enable `vm.expectEmit()` to work correctly in `prankFulfill`

## v0.1.3 (4f9ad0e)

- Allow different `AxiomInput` structs in different `AxiomTest` instantiations.

## v0.1.2 (089c09a)

- Fix ABI handling in Axiom cheatcode internals for dynamic types.

## v0.1.1 (b596acc)

- Fix input parsing for array types.

## v0.1.0 (0aac665)

- Implement Foundry cheatcodes to test Axiom V2 client contracts.
- Includes axiom-std specific CLI for compiling and proving Axiom circuits.
