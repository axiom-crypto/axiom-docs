---
sidebar_position: 3
sidebar_label: Axiom NodeJS Module
---

# Axiom NodeJS Module

To construct an Axiom client circuit and interact with it directly in Typescript, you will need to use the `Axiom` class. This is not necessary if you are only using the CLI, in which case you can skip directly to the [Axiom CLI Reference](/sdk/typescript-sdk/axiom-cli "mention").

The `Axiom` class exposes `prove` and `sendQuery` functionality and must be used in conjunction with the [Axiom CLI](/sdk/typescript-sdk/axiom-cli "mention") to first compile the circuit.

```typescript
import { Axiom } from '@axiom-crypto/client';
```

## `Axiom` class

The `Axiom` class is defined as

```typescript
export class Axiom<T> {
  constructor(inputs: {
    circuit: (inputs: T) => Promise<void>;
    compiledCircuit: AxiomV2CompiledCircuit;
    chainId: string;
    provider: string;
    privateKey?: string;
    version?: string;
    callback: AxiomV2CallbackInput;
    capacity?: AxiomV2CircuitCapacity;
    ipfsClient?: IpfsClient;
  })
}
```

This class is generic over a type `T`, which is the input type of the circuit. See [Data Types for Circuits](/sdk/typescript-sdk/axiom-circuit/circuit-types "mention") for more details.

- `circuit`: this is the client circuit code itself, which you write separately. The client circuit code is specified as an async function `(inputs: T) => Promise<void>`.
- `compiledCircuit`: the JSON build output from the CLI `compile` function
- `chainId`: the chain ID the on-chain data is gotten from. Only used for computation of `sendQueryArgs`. Does not affect circuit compilation or runs.
- `provider`: the JSON-RPC URL provider, this is used to make RPC calls to get on-chain data values (that are _not_ ZK-verified)
- `callback`:
  - `target`: the target contract address with the callback function
  - `extraData`: optional parameter to specify hex string of `bytes` for any extra data to pass to the callback

The functions in the `Axiom` class are:

### init

```typescript
async init()
```

Initializes the circuit using the compiled build artifacts specified in the constructor.

### setOptions

```typescript
setOptions(options: {
  maxFeePerGas?: string;
  caller?: string;
  callbackGasLimit?: number;
  overrideAxiomQueryFee?: string;
  refundee?: string;
})
```

Set options used to build the query.

- `maxFeePerGas`: optional argument to set maxFeePerGas, in wei, for Axiom to use on the fulfillment and callback transaction. Default is fetched from `provider.getFeeData()` at runtime.
- `caller`: optional argument for the sender address, only used for `queryId` calculation
- `callbackGasLimit`: optional argument to set the gas limit for the callback function. Default is `200000` gas.
- `overrideAxiomQueryFee`: optional argument to specify a higher query fee, in wei.
- `refundee`: address to refund payment to. Defaults to `caller`.

### setCallback

```typescript
setCallback(callback: {
    target?: string;
    extraData?: string;
  })
```

Set configuration options for the callback contract.

- `target`: the target contract address with the callback function and the 
- `extraData`: optional parameter to specify hex string of `bytes` for any extra data to pass to the callback

### prove

```typescript
async prove(input: RawInput<T>): Promise<AxiomV2SendQueryArgs>
```

Runs the circuit to generate a client-side ZK proof. The same circuit can be run on multiple different inputs.

- `input`: this is any type that can be parsed into the predefined circuit input type `T`
  - This will fail at runtime if, for example, you try to parse a hex string representing `uint256` into `CircuitValue`

The return type of `prove` is the `AxiomV2SendQueryArgs` interface:

```typescript
{
    address: string,
    abi: any,
    functionName: string = "sendQuery",
    value: bigint,
    args: Array<any>,
    queryId: string,
    calldata: string
}
```

- `address`: the `AxiomV2Query` address, calculated based on `AxiomCircuit` constructor arguments
- `abi`: the ABI of the `AxiomV2Query` contract
- `functionName`: always equals `sendQuery` (the function name on the callback contract)
- `value`: suggested payment value in `wei`, auto-calculated based on gas fees and costs
- `args`: the array of arguments to pass into the `sendQuery` function call, formatted exactly as it would be used in `ethers-js` or `viem`.&#x20;
  - `args = [sourceChainId, dataQueryHash, computeQuery, callback, salt, maxFeePerGas, callbackGasLimit, refundAddress, dataQuery]`
- `queryId`: the unique identifier for this query, including user information such as caller and callback address.
  - For this to match the `queryId` calculated on-chain, the input `callerAddress` must match the actual transaction sender address
- `calldata`: the hex string of the `args` encoded with `sendQuery` function selector. You can send a `sendQuery` transaction directly using this calldata.

### sendQuery

```typescript
async sendQuery(): Promise<TransactionReceipt>
```

Sends a query from args generated by `prove`. Requires that a private key was set in the `Axiom` constructor. To use your own signer, you can use `ethers-js` or `viem` to send a query using output of `prove`.
