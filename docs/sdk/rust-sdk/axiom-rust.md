---
description: Writing a Rust Axiom Client Circuit
sidebar_position: 5
sidebar_label: Axiom Rust SDK
---

# Axiom Rust SDK

:::warning
The Rust circuit SDK assumes more background in writing circuits with [halo2-lib](../../protocol/zero-knowledge-proofs/getting-started-with-halo2.md). We recommend using the Typescript SDK for most applications.
:::

The Rust SDK allows you to write more complex circuits, fully utilizing the capabilities of `halo2-lib`. 

## Installation

To install our Rust circuit SDK into a Cargo project, run:
```bash
cargo add axiom-sdk --git https://github.com/axiom-crypto/axiom-sdk-rs
```

## Overview

To implement an Axiom circuit using the Rust SDK you need to:

- Specify an input struct that consists of native Rust types and `ethers-rs` types (ie. `u64`, `Address`, `H256`, etc.). The struct name must end with `Input` (ie. `MyCircuitInput`).
- Implement the `AxiomComputeFn` trait on your input struct

## Input Specification

Your input struct can contain native Rust types (ie. `u64`, `[usize; N]`, etc.) and `ethers-rs` types (ie. `Address`, `H256`, etc.), and its name must end with `Input` (ie. `MyCircuitInput`). Additional types can be used if they implement the `RawInput` trait (see [here](https://github.com/axiom-crypto/axiom-sdk-rs/blob/main/circuit/src/input/raw_input.rs)). The struct must be annotated with the #[AxiomComputeInput] attribute so that it implements the sufficient circuit traits. This attribute will also generate a new struct with `Input` replaced with `CircuitInput` (ie. `AccountAgeInput` -> `AccountAgeCircuitInput`), which has all the fields of the specified struct, but with `halo2-lib` types to be used inside your circuit (like `AssignedValue<Fr>`).

Here is an example:

```rust
#[AxiomComputeInput]
pub struct AccountAgeInput {
    pub addr: Address,
    pub claimed_block_number: u64,
}
```

## Compute Function Specification

You must implement the `AxiomComputeFn` on your input struct. There is only one trait function that you must implement:
```rust
fn compute(
    api: &mut AxiomAPI,
    assigned_inputs: AccountAgeCircuitInput<AssignedValue<Fr>>,
) -> Vec<AxiomResult>
```
where `AccountAgeCircuitInput` should be replaced with your derived circuit input struct.

The `AxiomAPI` struct gives you access to subquery calling functions in addition to a `RlcCircuitBuilder` to specify your circuit. Your compute function should then return any values that you wish to pass on-chain in the `Vec<AxiomResult>` -- an `AxiomResult` is either an enum of either `HiLo<AssignedValue<Fr>>` or `AssignedValue<Fr>` (in which case it is converted to hi-lo for you).

Here is an example:
```rust
impl AxiomComputeFn for AccountAgeInput {
    fn compute(
        api: &mut AxiomAPI,
        assigned_inputs: AccountAgeCircuitInput<AssignedValue<Fr>>,
    ) -> Vec<AxiomResult> {
        let gate = GateChip::new();
        let zero = api.ctx().load_zero();
        let one = api.ctx().load_constant(Fr::one());
        let prev_block = gate.sub(api.ctx(), assigned_inputs.claimed_block_number, one);

        let account_prev_block = api.get_account(prev_block, assigned_inputs.addr);
        let prev_nonce = account_prev_block.call(AccountField::Nonce);
        let prev_nonce = api.from_hi_lo(prev_nonce);
        api.ctx().constrain_equal(&prev_nonce, &zero);

        let account = api.get_account(assigned_inputs.claimed_block_number, assigned_inputs.addr);
        let curr_nonce = account.call(AccountField::Nonce);
        let curr_nonce = api.from_hi_lo(curr_nonce);

        api.range.check_less_than(api.ctx(), zero, curr_nonce, 40);

        vec![
            assigned_inputs.addr.into(),
            assigned_inputs.claimed_block_number.into(),
        ]
    }
}
```

## Running The Circuit

To run your circuit, create a `main` function call the `run_cli` function with your input struct as the generic parameter:
```rust
fn main() {
    env_logger::init();
    run_cli::<AccountAgeInput>();
}
```
This will run a CLI that allows you to run mock proving, key generation, and proving of your circuit.

