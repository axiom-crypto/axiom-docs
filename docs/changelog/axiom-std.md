---
description: axiom-std versions
sidebar_position: 3
sidebar_label: axiom-std
---

# axiom-std

## v0.1.8 (729547c)

- Add support for Base mainnet
- Bump `@axiom-crypto/client` version to v2.0.9

## v0.1.7 (f9f71f2)

- Add support for Base Sepolia
- Add support for testing on chains Axiom is not yet deployed on
- Bump `@axiom-crypto/client` version to v2.0.8

## v0.1.6 (100a9bc)

- Add `peekResults` function to `Axiom`
- Bump `@axiom-crypto/client` version to v2.0.7

## v0.1.5 (0adda22)

- Add `ast = true` in `foundry.toml` in reaction to [foundry-rs/foundry#7197](https://github.com/foundry-rs/foundry/pull/7197)
- Bump `@axiom-crypto/client` version to v2.0.6

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
