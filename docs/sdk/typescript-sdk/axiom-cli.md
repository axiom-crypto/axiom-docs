---
description: Reference for the Axiom CLI
sidebar_position: 2
sidebar_label: Axiom CLI
---

# Axiom CLI

The Axiom CLI is a command-line interface for working with Axiom client circuits and query creation. It is available locally in an npm project once you install the Client SDK:

```bash npm2yarn
npm install @axiom-crypto/client
```

Within your project, the CLI can be run with

```bash
npx axiom circuit <command>
```

## `compile`

Command used to compile your circuit. This only needs to be done once on any given piece of circuit code. It does not depend on the circuit inputs, but a default input must be provided.

```bash
Usage: axiom circuit compile [options] <circuitPath>

compile an Axiom circuit

Arguments:
  circuitPath                path to the typescript circuit file

Options:
  -st, --stats               print stats
  -m, --mock                 generate a mock vkey and query schema
  -p, --provider [provider]  JSON-RPC provider (https)
  -o, --outputs [outputs]    outputs json file
  -f, --function [function]  function name in typescript circuit
  --cache [cache]            cache output file
```

- circuit path: the path to the Typescript file with your circuit code
- provider: the JSON-RPC provider URL
- inputs: the path to the default input JSON for the circuit
- outputs: output path for the compiled JSON
- function: the name of your circuit function
- stats: print circuit stats

The output will be a JSON written to the output path corresponding to the interface

```typescript
{
    vk: string,
    config: CircuitConfig,
    inputSchema: string,
    querySchema: string,
    circuit: string
}
```

The `vk`, `inputSchema`, and `circuit` are base64 encoded strings that along with `config`, can be used to reconstruct your circuit without re-compiling. The `querySchema` is a unique identifier of your circuit, which you should use to gate your smart contract callback function. The compiled JSON should not be modified -- to make changes, simply re-compile your circuit.

## `prove`

Command to run your compiled circuit on a given input. This command must be run after circuit is compiled.

```bash
Usage: axiom circuit prove [options] <compiledPath> <inputsFile>

prove an Axiom circuit

Arguments:
  compiledPath                         path to the compiled circuit json file
  inputsFile                           path to the inputs json file

Options:
  -s, --sourceChainId [sourceChainId]  source chain id
  -m, --mock                           generate a mock compute proof
  -st, --stats                         print stats
  -p, --provider [provider]            JSON-RPC provider (https)
  -o, --outputs [outputs]              outputs json file
  --cache [cache]                      cache input file
```

- compiled path: the path to the compiled circuit json file
- inputs file: json file containing inputs to the circuit
- source chain id: the chain from which data is being read
- compiled: the path to the JSON file output by `compile`
- provider: the JSON-RPC provider URL
- inputs: the path to the input JSON for the circuit, you can re-run the circuit on different inputs
- outputs: the output path for the run outputs
- function: the name of your circuit function
- stats: print circuit stats

The output will be a JSON written to the output path corresponding to the interface

```typescript
{
    sourceChainId: string,
    computeResults: string[], // bytes32[]
    computeQuery: AxiomV2ComputeQuery,
    dataQuery: DataSubquery[],
}
```

The `computeResults` are the `bytes32[]` array of outputs from your circuit on this particular run. This array is what is passed to the callback function when `AxiomV2Query` calls the callback.

The `computeQuery` and `dataQuery` are the many structs that make up the calldata sent in a query itself. They will be used by `sendQueryArgs`.

## `query-params`

Command to generate the exact arguments to use to create a transaction calling `sendQuery` on the `AxiomV2Query` contract.

```bash
Usage: axiom circuit query-params [options] <callback address>

generate parameters to send a Query into Axiom

Arguments:
  callback address                             callback address

Options:
  -s, --sourceChainId [sourceChainId]          source chain id
  -r, --refundAddress [refundAddress]          refundAddress
  -e, --callbackExtraData [callbackExtraData]  callback extra data
  --caller [caller]                            caller (defaults to refundAddress)
  --maxFeePerGas [maxFeePerGas]                maxFeePerGas
  --callbackGasLimit [callbackGasLimit]        callbackGasLimit
  -m, --mock                                   generate a mock query
  -p, --provider [provider]                    JSON-RPC provider (https)
  -pv, --proven [proven]                       `axiom circuit prove` outputs path
  -o, --outputs [outputs]                      query-params outputs path
  -a, --args-map                               sendQuery argments output as mapping for use with Forge
```

- callback address: the target contract address with the callback function
- sourceChainId: the chain ID that the historical data in the client circuit was taken from
- refundAddress: address to refund payment to
- callbackExtraData: hex string of `bytes` for any extra data to pass to the callback
- caller: optional argument for the sender address, only used for `queryId` calculation
- maxFeePerGas: optional argument to set maxFeePerGas, in wei, for Axiom to use on the fulfillment and callback transaction. Default is `25000000000 wei`
- callbackGasLimit: optional argument to set the gas limit for the callback function. Default is `200000` gas.
- mock: generate mock query data
- provider: the JSON-RPC provider URL for the chain the transaction will be sent on
- proven: the path to the JSON output by `prove`
- output: the output path for `query-params`
- args-map: arguments for sendQuery output as a mapping (as opposed to an array) for use with Forge

The output will be a JSON written to the output path corresponding to the interface

```typescript
{
    value: bigint,
    queryId: bigint,
    calldata: string,
    args,
}
```

where `args = [sourceChainId, dataQueryHash, computeQuery, callback, salt, maxFeePerGas, callbackGasLimit, refundAddress, dataQuery]` is the exact array to pass into `AxiomV2Query.sendQuery` for use with `ethers-js` or `viem`. `calldata` is the encoded calldata with the `sendQuery` function selector to call `AxiomV2Query` directly with.

- value: suggested payment value, in wei, for the query. Auto-calculated from gas cost estimations.
- queryId: a unique identifier of your query, including information about caller, refundee, and callback address. This can be used to check the status of your query both on-chain and in [Axiom Explorer](https://explorer.axiom.xyz/v2/sepolia/mock). Note that for this to be correct, you must set `caller` to the `msg.sender` of your transaction call.
