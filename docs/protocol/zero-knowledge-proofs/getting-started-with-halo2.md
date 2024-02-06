---
description: For developers who want to write ZK circuits in Halo2
sidebar_position: 6.3
sidebar_label: Getting Started with halo2
---

# Getting Started with halo2

Firstly, we _highly_ recommend that you use VSCode and the rust analyzer extension - especially when first learning halo2, the auto-complete and peek are extremely useful in learning the available API commands.

## **Learning Rust**

The [Rust book](https://doc.rust-lang.org/book/) is a good place to get started: the first 5 chapters are elementary and effectively mandatory to read. For more advanced Halo2 usage, it is necessary to know about closures (Ch 13). Later it may be helpful to know about smart pointers (Ch 15), though for performance it's best to not use them when possible.

**Our recommendation:** to ramp up as quickly as possible, read the first 5 chapters of the Rust book and then try to write a ZK circuit [using halo2-lib](https://github.com/axiom-crypto/halo2-scaffold/). Rust questions are bound to come up as you go, and you can find answers on-the-fly with Google and the Rust book.

To learn rust best practices, we recommend turning on `cargo clippy` instead of just `cargo check` in VSCode->Rust analyzer->Check on save command.

## **Halo2-lib**

In the rest of this doc we will explain how to write ZK circuits using the [halo2-lib](https://github.com/axiom-crypto/halo2-lib) library. We created the halo2-lib library to have a faster, easier API to develop in Halo2.&#x20;

### Simplified interface

In [`halo2-lib`](https://github.com/axiom-crypto/halo2-lib), the basic frontend interface is that you have a table with two columns and a number of rows which you can specify. The first column, known as the **advice** column, consists of numbers (called **witnesses**), which the Prover gets to fill in on a _per-proof_ basis. The second column, known as the **selector** column, consists of boolean numbers (0 or 1), which are determined _once and for all_ when the circuit is created. After circuit creation, the selector column is shared with both the prover and the verifier (in some form).&#x20;

| Advice   | Selector |
| -------- | -------- |
| $a_0$    | $s_0$    |
| $a_1$    | $s_1$    |
| $a_2$    | $s_2$    |
| $\vdots$ | $\vdots$ |

What prevents the prover from putting arbitrary numbers into the advice column is that we impose a single "custom gate" which must hold on **every** 4 consecutive rows: with `a, b, c, d` in a single (vertical) advice column and a selector cell `q` as below:

| Advice | Selector |
| ------ | -------- |
| $a$    | $q$      |
| $b$    |          |
| $c$    |          |
| $d$    |          |

the constraint

```
q * (a + b * c - d) == 0
```

must hold. This gate is applied at _every_ row, so at each row you specify whether `q` is `0` or `1` to turn on/off the gate. If `q = 1`, then you impose `a + b * c == d`. If `q = 0`, then there is no constraint. (Implicitly, this assumes that the last 3 rows have `0` in the selector column.)&#x20;

The reason that this constraint must hold on every row is due to the nature of the proving system, which uses polynomial commitment schemes behind the scenes.

In this framework, to design a circuit you:

- Provide an algorithm that specifies how the Prover should fill in the advice column on each run of a computation.
- Specify which cells to turn the selector "on" (place a `1` in the cell). By default all cells have value `0`.

Below we will walk through some examples showing how to use the `halo2-lib` API. You can skip ahead to see the list of available functions in this API [here](#available-api-functions).

## Examples walkthrough

We have provided some examples of how to use `halo2-lib` in a quick-setup sandboxed environment in the [halo2-scaffold](https://github.com/axiom-crypto/halo2-scaffold) repository. We will walk through the examples there as a way to explain the `halo2-lib` API in more detail.&#x20;

### [halo2_lib.rs](https://github.com/axiom-crypto/halo2-scaffold/blob/main/examples/halo2_lib.rs)

In this example, we have a single function `some_algorithm_in_zk` that has all the custom computation logic for our ZK circuit. In this case it is a computation that only takes in one input number `x`. The computation computes `x -> x**2 + 72` and outputs this as a public output.

#### `main()`

In the `main()` function, we create a command-line handler that will perform operations (mock prove, keygen, prove) on the circuit specified by `some_algorithm_in_zk`:

```rust
fn main() {
    env_logger::init();

    let args = Cli::parse();

    // run different zk commands based on the command line arguments
    run(some_algorithm_in_zk, args);
}
```

where `run` is a helper function we have provided to handle different command-line instructions for you. Additional instructions on the different command-line options are provided [here](https://github.com/axiom-crypto/halo2-scaffold/blob/main/README.md#quick-start-with-halo2-lib).

#### `some_algorithm_in_zk`

We now inspect the actual computation in ZK we want to perform. The function format is:

```rust
fn some_algorithm_in_zk<F: ScalarField>(builder: &mut BaseCircuitBuilder<F>, input: CircuitInput, make_public: &mut Vec<AssignedValue<F>>)
```

It is customary to write re-usable functions where the numbers are in a generic prime field `F`. Here `ScalarField` is a rust trait that implements all of the operations you would expect of a prime field.

The parameter `builder` is a mutable reference to a `BaseCircuitBuilder<F>` struct. This is roughly the data of the running list of numbers you are putting into the Advice and Selector columns we described above.

In this computation, we take `input: CircuitInput`, which contains a single string `input.x`. In general you can replace `CircuitInput` by any type that you would like to use to describe your input.

Lastly we have `make_public`, which is a mutable reference to a vector of `AssignedValue`s. We'll talk about `AssignedValue`s below, but you can assume this vector starts off empty; then you push onto it any witness values that you would like to make public. By default, all witness values are considered private, so you must consciously decide to make something public.

Let's begin looking at the code inside `some_algorithm_in_zk` now.

We first deserialize `input.x` into a single field element `x: F`. This is purely an input processing step.

```rust
let x = F::from_str_vartime(&input.x).expect("deserialize field element should not fail");
```

Next, we have

```rust
let ctx = builder.main(0);
let x = ctx.load_witness(x);
```

For the purposes of this introduction, we always start with `ctx = builder.main(0)` and we can think of `ctx` and `builder` as the same thing. (In more advanced usage, `builder` allows multi-threaded witness generation and support for multiple challenge phases.)

Here the `x: F` on the right hand side is our initial input. We need to add it into our system in order to do anything with it. This is done by `ctx.load_witness`, which places the value `x` in the first row of our table:

| Advice | Selector |
| ------ | -------- |
| `x`    |          |

To use `x` later, we want a pointer to both the value of `x` and its location in the table (i.e., it's row index). This is what is returned in the `x` on the left hand side, which is of type `AssignedValue<F>`. The `AssignedValue` struct is simply a pointer containing the information of value and cell location.

This assigned `x` can now be thought of as a _private_ input: by default all witness values in Halo2 are considered private. If we want to make this a public input, i.e., an input the Verifier has access to, we need to explicitly add it to the list of public values:

```rust
make_public.push(x);
```

(The order you push values to `make_public` determines the order the public values are read by the Verifier.)

```rust
let gate = GateChip::<F>::default();
```

Now we want to make use of the existing library functions of `halo2-lib`. These are contained in `GateChip`. This struct only needs to be created once for the duration of the program. It contains some pre-computed constants for optimization and is otherwise just a container for various common functions we found helpful for development. The list of available functions is provided [below](getting-started-with-halo2.md#gatechip-functions).

For example, we would like to compute `x**2`. `GateChip` contains a `mul` function, so we can call

```rust
let x_sq = gate.mul(ctx, x, x);
```

What this function does behind the scenes is assign intermediate numbers to the advice column and turn on the appropriate selectors to properly constrain the computation logic (both by mutating `ctx`). It then returns an `AssignedValue` pointing to the output of the multiplication operation, somewhere in our table.

If we look at the function declaration of `mul`, it is

```rust
fn mul(
    &self,
    ctx: &mut Context<F>,
    a: impl Into<QuantumCell<F>>,
    b: impl Into<QuantumCell<F>>,
) -> AssignedValue<F>
```

We have described all the structs here except `QuantumCell<F>`.

#### What is a `QuantumCell`?

```rust
pub enum QuantumCell<F: ScalarField> {
    Existing(AssignedValue<F>),
    Witness(F),
    WitnessFraction(Assigned<F>),
    Constant(F),
}
```

A `QuantumCell` is a convenience enum we have introduced because there are several slightly different scenarios under which you want to add a value into the advice column:

- You want to re-use or reference an existing value from some previous part of your computation. In this case the previous value is already in the table, so it is in the form of an `AssignedValue`. This corresponds to the `Existing` enum option. More technically, what happens when you add an existing cell `a` into the table is that it will assign a new cell into the advice column with value equal to the value of `a`. Then it will impose an _equality constraint_ between the new cell and the cell of `a` so the Verifier has a guarantee that these two cells are always equal.
- You want to add an entirely new number into the table. For example, this was the case when we were supplying a private input. This corresponds to the `Witness(F)` option.
- The `WitnessFraction` option is similar to `Witness` but is used for optimization purposes, so we won't go over it here (and on first pass you never need to use it).
- You want to use a number in your computation that should be a known constant. Here "known" means known at circuit creation time to both the Prover and Verifier. This corresponds to the `Constant(F)` option. What happens behind the scenes when you assign a constant number is that there is actually another secret "Fixed" column in the table which is fixed at circuit creation time. When you assign a `Constant` number, you are adding this number to the Fixed column, adding the number as a witness to the Advice column, and then imposing an equality constraint between the two corresponding cells.

When you place a number into the table, we do want you to be mindful of which of these cases you are using. However this mindfulness should not lead to extra code bloat or excessive case handling. Instead, you just need to specify which `enum` option in `QuantumCell` it corresponds to, and the technical operations described above are done for you.

Now that we have discussed `QuantumCell`, we mention that an equivalent way to call `gate.mul(ctx, x, x)` is to write

```rust
gate.mul(ctx, Existing(x), Existing(x));
```

However we discovered that most "values" used in a computation are usually pointers to values from previous functions, aka `AssignedValue`. Therefore we removed the necessity to always type `Existing`. Now whenever you specify an `AssignedValue,` rust is smart enough to infer it is of enum option `Existing`.

Now the rest of this code snippet should make sense:

```rust
let c = F::from(72);
let out = gate.add(ctx, x_sq, Constant(c));
make_public.push(out);
```

We took the result of the `x**2` computation, `x_sq`, add the constant number `72` to it, and then declare this output witness value public.

In our discussion we have distinguished between public inputs vs outputs because this is the more familiar viewpoint from a Prover computation perspective. However Halo2 does not make this distinction: since the Verifier sees all public inputs and outputs at the same time, there is no distinction in Halo2 between inputs and outputs. This is why both the input and the output were pushed to the same `make_public` vector.

This got us through an entire complete ZK computation! You can run

```bash
cargo run --example halo2_lib -- --name halo2_lib -k 10 mock
```

to see the MockProver run in action.

But wait, there's more code in the example?

#### Diving deeper: `ctx.assign_region`

What is `gate.mul` really doing behind the scenes? Remember our table started off with just

| Advice | Selector |
| ------ | -------- |
| `x`    | `0`      |

The call `gate.mul(ctx, x, x)` fills in the following values into our table:

| Advice | Selector |
| ------ | -------- |
| `x`    | `0`      |
| `0`    | `1`      |
| `x`    | `0`      |
| `x`    | `0`      |
| `x**2` | `0`      |

and constrains that the advice values in rows 2, 3 must equal the one in row 0. Observe that the selector value `1` in row 1 imposes the constrain `0 + x * x == x**2`, which constrains that the value in row 4 _must_ equal the product of the values in rows 2, 3.

If you look at the [implementation](https://github.com/axiom-crypto/halo2-lib/blob/8b54c999ceb3be15cc7350fad229770c54f6802d/halo2-base/src/gates/flex_gate/mod.rs#L245) of `mul`, this is exactly what the function is doing by making the following "raw" calls:

```rust
let val = *x.value() * x.value();
ctx.assign_region([Constant(F::zero()), Existing(x), Existing(x), Witness(val)], [0]);
return ctx.get(-1);
```

The `ctx.assign_region` function can be thought of as a low-level function to write assembly-level code. The first argument tells the system to lay down 4 new values. The second argument specifies the _relative row offsets_ (with respect to the to-be-laid-down values) to turn on (put a `1` in) selector cells. Because we already had `1` row in our table, the argument `[0]` tells it to enable the selector in row `1 + 0 = 1`. Lastly, `assign_region` only lays down the cells. To access the `AssignedValue`s, you can call `ctx.get(isize)` to access an index in the current list of advice values. Asking for `ctx.get(-1)` returns the last advice value, which is the pointer to the cell where the witness value `x**2` gets assigned.&#x20;

Note that in this low-level language, we had to separately supply the witness value `val` for `x**2`. This is first inserted into the table as a `Witness` because this is the first time the system has seen the value; then separately the selector is what constrains that this value _must_ be correctly computed. Lastly, once it is inserted into the table, we use the pointer to its position as an `AssignedValue` for downstream computations.

The pattern of calling `ctx.assign_region` and then `ctx.get(-1)` is so common that we provide a convenience function `ctx.assign_region_last` that does both at once.

#### Optimizing

First, it is an exercise to see that the function calls up to now result in the following table:

| Advice      | Selector |
| ----------- | -------- |
| `x`         | `0`      |
| `0`         | `1`      |
| `x`         | `0`      |
| `x`         | `0`      |
| `x**2`      | `0`      |
| `x**2`      | `1`      |
| `1`         | `0`      |
| `72`        | `0`      |
| `x**2 + 72` | `0`      |

In the `halo2-lib` interface, one can estimate cost modeling by simply counting the total number of advice cells used by the circuit. In this case, we have used `9` advice cells total. Can we do better?

Yes! Because our custom gate is of the form `s * (a + b * c - d) == 0`, it is uniquely well-suited for the multiply-then-add operation. We could instead use the following table:

| Advice      | Selector |
| ----------- | -------- |
| `x`         | `0`      |
| `72`        | `1`      |
| `x`         | `0`      |
| `x`         | `0`      |
| `x**2 + 72` | `0`      |

We implement this with the following code:

```rust
// ==== way 2 =======
let val = *x.value() * x.value() + c;
let _val_assigned =
    ctx.assign_region_last([Constant(c), Existing(x), Existing(x), Witness(val)], [0]);
```

Finally, this multiply-and-add pattern is common enough that we provide a special function that does the above assignment for you:

```rust
// ==== way 3 ======
// this does the exact same thing as way 2, but with a pre-existing function
let _val_assigned = gate.mul_add(ctx, x, x, Constant(c));
```

For debugging purposes or to create tests to check your circuit's computation against some other rust-native computation, do you print out any of the witness values in the circuit and do assertion checks using usual rust commands:

```rust
println!("x: {:?}", x.value());
println!("val_assigned: {:?}", _val_assigned.value());
assert_eq!(*x.value() * x.value() + c, *_val_assigned.value());
```

This completes the walkthrough of the `halo2_lib.rs` example. To write your own circuit, you can copy `halo2_lib.rs` to its own file `my_example.rs`, replace `some_algorithm_in_zk` with your own implementation, and run

```bash
cargo run --example my_example -- --name my_example -k <k> mock
```

where `k` specifies you want your circuit to have `2**k` rows (you can set `k = 10` to start out).

Again, you can find the available API functions for `GateInstructions` [here](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html).

### [range.rs](https://github.com/axiom-crypto/halo2-scaffold/blob/main/examples/range.rs)

When interacting with numbers in a ZK circuit, one often ends up needing an operation called `range_check` of constraining that a field element number `x` is within a certain number of bits. In `halo2-lib`, we offer this functionality in a separate `RangeChip`.

The available functions for `RangeChip` are provided [below](getting-started-with-halo2.md#rangechip-functions).

`RangeChip` is a generalization of `GateChip` from the previous example. In fact, a `RangeChip` contains a `GateChip` (and its associated functions) which can be accessed via

```rust
range.gate()
```

The general structure of `some_algorithm_in_zk` is the same in this example as in the previous example.

You only need to create a `RangeChip` once for the entire duration of the circuit runtime (which automatically creates a `GateChip` as well).

```rust
let range = builder.range_chip(lookup_bits);
```

The constructor for `RangeChip` requires an additional parameter `lookup_bits`.

Now given some `x: AssignedValue<F>`, we can check that it has 64 bits, i.e., constrain that `x` is in `[0, 2**64)` using the function

```rust
range.range_check(ctx, x, 64);
```

Note that `range_check` allows you to perform a range check on an arbitrary number of bits, independent of the value of `lookup_bits`. This is because we have already implemented some extra logic in `range_check` to provide this extra level of generality.

#### Diving deeper: lookup tables

Why is `RangeChip` a separate struct from `GateChip`? This is because behind the scenes, the implementation of `range_check` uses a new Halo2 feature: [lookup tables](https://zcash.github.io/halo2/user/lookup-tables.html). We will not go into the details around lookup tables here, but an overview is that we create a table with the numbers `[0, 2**lookup_bits)`. Then Halo2 provides an API features that allows us to constrain whether a field element appear in this table.&#x20;

For example, if `lookup_bits = 8`, we can prove a number is in `64` bits by decomposing it into 8 bytes (`8` bits each), proving the decomposition is correct, and additionally use the lookup table to prove each byte is actually a byte.&#x20;

Without a lookup table, the traditional way to perform all range checks is to decompose a number into its bit representation, prove the bit decomposition is correct, and then prove each bit is a bit. For large bits to range check, you can see how the lookup table approach can be more efficient than the bit decomposition approach.

#### Technical detail: How to choose `LOOKUP_BITS`

You can run this example via

```bash
LOOKUP_BITS=8 cargo run --example range -- --name range -k <k> mock
```

Here `k` specifies that the circuit will have `2**k` rows. You can let `LOOKUP_BITS` be any (nonzero) number less than `k`. As we mentioned, the value of `LOOKUP_BITS` doesn't affect the functionality of `range_check`.

However, the choice of `LOOKUP_BITS` will affect circuit performance. Here are some rough guidelines:

- If you know you will only do lookups on a fixed number of bits, then set `LOOKUP_BITS` to that number.
- If you will be doing variable length range checks, generally you should set `LOOKUP_BITS = k - 1`.

## Available API functions

### `GateChip` functions

The list of available functions in `GateChip` is below. For more details, see the [`GateInstructions` trait](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html), which `GateChip` implements.

#### Basic arithmetic operations

- [add](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#method.add)
- [div_unsafe](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#method.div_unsafe)
- [neg](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#method.neg)
- [mul_not](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#method.mul_not)
- [mul_add](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#method.mul_add)
- [mul](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#method.mul)
- [sub](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#method.sub)

#### Unary assertion operations

- [assert_is_const](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#method.assert_is_const)
- [is_zero](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#method.is_zero)
- [is_equal](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#method.is_equal)

#### Bit operations

- [and](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#method.and)
- [assert_bit](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#method.assert_bit)
- [or_and](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#tymethod.or_and)
- [or](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#method.or)
- [num_to_bits](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#tymethod.num_to_bits)
- [not](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#method.not)

#### Array selection functions

- [bits_to_indicator](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#method.bits_to_indicator)
- [idx_to_indicator](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#method.idx_to_indicator)
- [select_from_idx](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#method.select_from_idx)
- [select_by_indicator](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#method.select_by_indicator)
- [select](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#tymethod.select)

#### Accumulating functions

- [accumulated_product](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#method.accumulated_product)
- [inner_product](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#tymethod.inner_product)
- [inner_product_with_sums](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#tymethod.inner_product_with_sums)
- [lagrange_and_eval](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#method.lagrange_and_eval)
- [partial_sums](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#method.partial_sums)
- [sum](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#method.sum)
- [sum_products_with_coeff_and_var](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/flex_gate/trait.GateInstructions.html#tymethod.sum_products_with_coeff_and_var)

### `RangeChip` functions

Similarly, we provide the list of functions in `RangeChip`. For more details, see the [`RangeInstructions` trait](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/range/trait.RangeInstructions.html), which `RangeChip` implements.

#### Range check

- [range_check](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/range/trait.RangeInstructions.html#tymethod.range_check)

#### Comparison operations

- [check_less_than](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/range/trait.RangeInstructions.html#tymethod.check_less_than)
- [check_big_less_than_safe](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/range/trait.RangeInstructions.html#method.check_big_less_than_safe)
- [check_less_than_safe](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/range/trait.RangeInstructions.html#method.check_less_than_safe)
- [is_big_less_than_safe](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/range/trait.RangeInstructions.html#method.is_big_less_than_safe)
- [is_less_than](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/range/trait.RangeInstructions.html#tymethod.is_less_than)
- [is_less_than_safe](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/range/trait.RangeInstructions.html#method.is_less_than_safe)

#### Integer remainder operations

- [div_mod](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/range/trait.RangeInstructions.html#method.div_mod)
- [div_mod_var](https://docs.rs/halo2-base/0.4.1/halo2_base/gates/range/trait.RangeInstructions.html#method.div_mod_var)

### `halo2-ecc`

To see an entire library of elliptic curve cryptographic primitives that we built on top of `GateChip` and `RangeChip`, see the crate [`halo2-ecc`](https://github.com/axiom-crypto/halo2-lib/tree/main/halo2-ecc).&#x20;

## Exercise

What is the most optimal way to compute the dot product $$(a_0,\dotsc, a_n) \cdot (b_0,\dotsc,b_n) = a_0\cdot b_0 + \dotsc + a_n \cdot b_n$$ using just the `halo2-lib` gate [above](getting-started-with-halo2.md#simplified-interface)?&#x20;

Here "compute" means that you can copy in the values of $$a_0,\dotsc,a_n, b_0,\dotsc,b_n$$ into any cells you want. And you should have enough constraints to constrain that the final cell must have value equal to the dot product.

You can find a solution to this exercise in our [code](https://github.com/axiom-crypto/halo2-lib/blob/c7bb4a842fd03c0b96fc46f37ba3e42a053157b2/halo2-base/src/gates/flex_gate.rs#L676).

## Feature: more columns

In our description of the `halo2-lib` interface above, we had a single advice column and a single selector column. For a big computation, the number of rows in this table will get very large. For the Prover, this means they need to perform certain operations on a very large vector (column). These operations include Fast Fourier Transform and certain elliptic curve operations (multi-scalar multiplication). For performance, it is generally faster to parallelize such operations across multiple vectors of shorter length instead of a single large vector.

In the halo2 context, this translates to the preference for multiple columns in a table with less rows (while keeping total number of cells the same). There is a natural way to do this: we simply take our single advice column and single selector column, divide it up into chunks, and re-arrange the table to have more columns:

| Advice 0 | Selector 0 | Advice 1 | Selector 1 | ... |
| -------- | ---------- | -------- | ---------- | --- |
| $a_0$    | $s_0$      | $b_0$    | $t_0$      |     |
| $a_1$    | $s_1$      | $b_1$    | $t_1$      |     |
| $a_2$    | $s_2$      | $b_2$    | $t_2$      |     |
| $\vdots$ | $\vdots$   | $\vdots$ | $\vdots$   |     |

(We glossed over that there is a technicality that you should not divide a column in the middle of an "enabled" gate.)&#x20;

The `halo2-lib` does this division from `1` column into multiple columns automatically: you specify the environmental variable `DEGREE`, which specifies that the desired number of rows of the circuit is `2 ** DEGREE` (it must be a power of two for FFT reasons). Then `halo2-lib` will auto-configure your circuit from `1` column into the minimum number of columns necessary to fit within the desired number of rows.

Why not just increase the number of columns indefinitely? There is a limit to parallelism, so generally the proving time vs. number of columns plot looks parabolic: as you increase number of columns (while keeping number of cells the same), the proving time will decrease up to a point before starting to increase again.

Lastly, the improvement to proving time performance from increasing the number of columns is not free. It comes at the cost of increasing the burden of computation for the Verifier. On the CPU this means longer Verifier times. On the EVM this means to verify a ZK proof on-chain, the gas cost increases as you increase the number of columns used.

## Saved reading for later

If you find that `halo2-lib` does not provide enough functionality for your ZK circuit needs, or if you are just curious, you can check out the full "vanilla" Halo2 API documention in the [halo2 book](https://zcash.github.io/halo2/).&#x20;

- We have also assembled a [Halo2 Cheatsheet](https://hackmd.io/@axiom/HyoXzD7Zh) with a growing collection of observations we found helpful when first interacting with the vanilla Halo2 API.&#x20;
