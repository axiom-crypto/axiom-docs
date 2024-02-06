---
description: For a peek at the math behind ZKPs
sidebar_position: 6.2
sidebar_label: ZK Examples
---

# ZK Examples

## Example: PLONK

There are various options of what kind of front-end to use to design a ZK circuit. The [PLONK](https://eprint.iacr.org/2019/953.pdf) system is one such way. We will describe it below, and it will be a good way of preparing us for the full [PLONKish arithmetization](https://hackmd.io/@aztec-network/plonk-arithmetiization-air) used in [halo2](https://github.com/privacy-scaling-explorations/halo2), which is what Axiom uses in production.

A PLONK circuit consists of a table/matrix with the following fixed columns and nearly arbitrary number of rows:

|`a`|`b`|`c`|`q_L`|`q_R`|`q_M`|`q_C`|`q_O`|
|---|---|---|---|---|---|---|---|
|.|.|.|

where the numbers in the columns $$q_L, \dotsc, q_O$$ are **fixed** once and for all at compile time. Meanwhile the numbers in columns $$a, b, c$$ are called **witnesses** and specified by the prover each time a new proof is generated. What makes the circuit meaningful, and not a random collection of numbers, is that for each row $$i$$, the following equation is guaranteed to hold:

$$
q_L \cdot a + q_R \cdot b + q_M \cdot a \cdot b + q_C = q_O \cdot c
$$

Since the $$q$$ columns are fixed once and for all, specifying these numbers allows you to "mold" the circuit to constrain the witnesses $$a, b, c$$ to perform certain computations.

For example, if you want to add $$a_i + b_i = c_i$$ in row $$i$$, put:

|`a`|`b`|`c`|`q_L`|`q_R`|`q_M`|`q_C`|`q_O`|
|---|---|---|---|---|---|---|---|
|`a_i`|`b_i`|`c_i`|`1`|`1`|`0`|`0`|`1`|

To multiply $$a_i \cdot b_i = c_i$$ in row $$i$$, put:

|`a`|`b`|`c`|`q_L`|`q_R`|`q_M`|`q_C`|`q_O`|
|---|---|---|---|---|---|---|---|
|`a_i`|`b_i`|`c_i`|`0`|`0`|`1`|`0`|`1`|

To force $$a_i$$ to be a known constant $$C$$, put:

|`a`|`b`|`c`|`q_L`|`q_R`|`q_C`|`q_O`|
|---|---|---|---|---|---|---|
|`a_i`|`*`|`*`|`1`|`0`|`0`|`-C`|`0`|

Note that $$b_i, c_i$$ can be any numbers and it doesn't matter.

So far, we can use the above to do single line computations. There is one more ingredient: one can also specify once and for all that certain predetermined cells in the table above are always equal. For example, for some $$i_0$$, we must have $$c_ i_0 = a_ i_0 + 1$$. This now allows us to carry results of previous computations into new computations, "chaining" to create longer computations.

### Summary

To summarize, creating a ZK proof involves the following steps:

Once and for all, specify the circuit itself:

* Specify all cells in columns $$q_L, q_R, \dotsc, q_O$$.
* Specify any equality constraints between cells.
* The verifier receives the above information in a _compressed_ form.
* The prover holds onto a copy of the above information itself.

To submit a proof:

* Do the computation itself, i.e., generate the witnesses $$a_i, b_i, c_i$$.

### Backend

While circuit design involves just filling out a table using some front end, to actually create a proof there is a backend that takes the PLONK table above and does a bunch of computations involving polynomial commitment schemes. This part is largely independent of the circuit design, but different backends lead to different performance characteristics, which become important to understand for production use cases.
