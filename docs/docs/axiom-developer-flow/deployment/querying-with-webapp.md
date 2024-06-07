---
description: Sending queries in your webapp
sidebar_position: 1
sidebar_label: Querying in Your Webapp
---

# Sending Queries in Your Webapp

This tutorial gives an explanation of what's happening as we run . It assumes that you've already run `npx create-axiom-client` and selected the Next.js option to build a Next.js webapp scaffold.

The reference implementation is in this repository: [https://github.com/axiom-crypto/axiom-scaffold-nextjs/](https://github.com/axiom-crypto/axiom-scaffold-nextjs/)

## Setup

You will need to duplicate `.env.local.example` and rename as `.env.local`, and then add your environment variables to `.env.local`.

## Circuit Compilation and Usage

Every time you edit the circuit, you must [compile](/sdk/typescript-sdk/axiom-cli#compile) the circuit using the [Axiom CLI](/sdk/typescript-sdk/axiom-cli#compile) to generate build artifacts for your webapp. We recommend adding this compilation step as an npm script.

```json title="package.json (in root directory of project)"
"scripts": {
  "circuit:compile": "axiom circuit compile app/axiom/circuitName.circuit.ts"
}
```

Run the compilation command via:

```bash npm2yarn
npm run circuit:compile
```

:::info
This example script assumes the exported circuit function inside the `circuitName.circuit.ts` file is also named `circuit` and a default input is provided in `app/axiom/data/inputs.json`. See the [Axiom CLI reference](/sdk/typescript-sdk/axiom-cli) for more options.
:::

## Running the Next.js web server

To start the webapp, run the Next.js web server from the `app/` folder

```bash npm2yarn
cd app
npm run dev
```

## Editing Your Webapp's Settings

All Axiom-related settings are stored in `app/src/app/lib/webappSettings.ts`. You can edit this file to change things like your circuit, default inputs, callback info, etc.

```typescript title="app/src/app/lib/webappSettings.ts"
import compiledCircuit from "../../axiom/data/compiled.json";
import inputs from "../../axiom/data/inputs.json";
import AverageBalanceAbi from "./abi/AverageBalance.json";

export const WebappSettings = {
  compiledCircuit,
  inputs,
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL_11155111 as string,
  chainId: "11155111",
  callbackTarget: "0x50F2D5c9a4A35cb922a631019287881f56A00ED5",
  callbackAbi: AverageBalanceAbi,
}
```

You can then follow the on-screen directions to build and send a query. The following sections describe different parts of the Next.js webapp, so you can modify them as necessary.

## The `Providers` wrapper for `AxiomCircuitProvider`

The `app/src/app/provider.tsx` file wraps all of the required providers for for Wagmi and also our `AxiomCircuitProvider` that's exported from `@axiom-crypto/react`. This `Providers` component is used to prevent hydration errors when `AxiomCircuitProvider` is mounting.

```typescript title="app/src/app/provider.tsx"
"use client";

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from '@/lib/wagmiConfig';
import { useEffect, useState } from "react";
import { AxiomCircuitProvider } from "@axiom-crypto/react";
import { WebappSettings } from "@/lib/webappSettings";
import { BridgeType } from "@axiom-crypto/client/types";

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AxiomCircuitProvider
          compiledCircuit={WebappSettings.compiledCircuit}
          rpcUrl={WebappSettings.rpcUrl}
          chainId={WebappSettings.chainId}
        >
          {mounted && children}
        </AxiomCircuitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

`<Providers>` is then inserted into `layout.tsx`, around `{children}`.

```typescript title="app/src/app/layout.tsx"
...
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        ...
          <Providers>
            {children}
          </Providers>
        ...
      </body>
    </html>
  )
}
...
```

## Using the Axiom Circuit Hook

You can pass data into the `useAxiomCircuit` hook and then call `build()` on it to build the Axiom query. 

```typescript title="app/src/app/components/BuildQuery.tsx"
"use client"

import { useAxiomCircuit } from "@axiom-crypto/react";
import { useEffect } from "react";
import { WebappSettings } from "@/lib/webappSettings";

export default function BuildQuery({
  inputs,
  callbackAddress,
  callbackExtraData,
  refundee,
}: {
  inputs: UserInput<typeof WebappSettings.inputs>;
  callbackAddress: string;
  callbackExtraData: string;
  refundee: string;
}) {
  const {
    build,
    builtQuery,
    setParams,
    areParamsSet,
  } = useAxiomCircuit<typeof WebappSettings.inputs>();

  // Set the parameters for the component
  useEffect(() => {
    setParams(inputs, callbackAddress, callbackExtraData, refundee);
  }, [setParams, inputs, callbackAddress, callbackExtraData, refundee]);

  useEffect(() => {
    const buildQuery = async () => {
      // Only build the query if params are set
      if (!areParamsSet) {
        return;
      }
      // Build the query, which saves the output to the `builtQuery` variable
      await build();
    };
    buildQuery();
  }, [build, areParamsSet]);

  if (builtQuery) {
    // can now use `builtQuery` to send an on-chain Query to Axiom
  }
}
```

Once those query parameters are built, they are saved into the `builtQuery` variable. Now you can render another Component that will handle sending the query transaction. `builtQuery` can be passed directly into Wagmi's `useSimulateContract` hook to then pass into `writeContract` from the `useWriteContract` hook.

```typescript title="app/src/app/components/SendQuery.tsx"
"use client";
import { Constants } from "@/shared/constants";
import { useWriteContract, useSimulateContract } from "wagmi";
import { useAxiomCircuit } from '@axiom-crypto/react';

export default function SendQueryComponent() {
  const { builtQuery } = useAxiomCircuit();

  // Pass the full builtQuery object into wagmi's `useSimulateContract`
  const { data } = useSimulateContract({
    ...builtQuery!,
    address: builtQuery!.address as `0x${string}`,
  });
  const { writeContract } = useWriteContract();

  return (
    <button
      disabled={!Boolean(data?.request)}
      onClick={() => writeContract(data!.request)}
    >
      {"Send Axiom Query"}
    </button>
  )
}
```

Once the query is submitted on-chain, you can handle the additional logic as you see fit.

## Using different chains

We currently support Ethereum Mainnet, Sepolia, and Base Sepolia. You can simply modify the `WebappSettings` object to the appropriate values for the chain you'd like to use. Ensure that the `callbackTarget` is a valid contract that will accept an Axiom callback. For example, if you want to use Base Sepolia:

```typescript title="app/src/app/lib/webappSettings.ts"
...
export const WebappSettings = {
  compiledCircuit,
  inputs,
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL_84532 as string,
  chainId: "84532",
  callbackTarget: "0x50F2D5c9a4A35cb922a631019287881f56A00ED5",
  callbackAbi: AverageBalanceAbi,
}
```

## Crosschain queries

Crosschain queries can be built and sent in a similar fashion to standard queries with a few changes.

```typescript title="app/src/app/lib/webappSettings.ts"
export const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string;
export const SOURCE_CHAIN_ID = "11155111";
export const TARGET_CHAIN_ID = "84532";

export const WebappSettings = {
  compiledCircuit,
  inputs,
  sourceProvider: getProviderClientSide(SOURCE_CHAIN_ID),
  sourceChainId: SOURCE_CHAIN_ID,
  targetProvider: getProviderClientSide(TARGET_CHAIN_ID),
  targetChainId: TARGET_CHAIN_ID,
  callbackTarget: "0x50F2D5c9a4A35cb922a631019287881f56A00ED5",
  callbackAbi: AverageBalanceAbi,
  explorerBaseUrl: chainIdToExplorerBaseUrl(TARGET_CHAIN_ID),
}
```

```typescript title="app/src/app/providers.tsx"
"use client";

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from '@/lib/wagmiConfig';
import { useEffect, useState } from "react";
import { AxiomCrosschainCircuitProvider } from "@axiom-crypto/react";
import { WebappSettings } from "@/lib/webappSettings";
import { BridgeType } from "@axiom-crypto/client/types";

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AxiomCrosschainCircuitProvider
          source={{
            chainId: "11155111",
            rpcUrl: process.env.NEXT_PUBLIC_RPC_URL_11155111!,
          }}
          target={{
            chainId: "84532",
            rpcUrl: process.env.NEXT_PUBLIC_RPC_URL_84532!,
          }}
          bridgeType={BridgeType.BlockhashOracle}
          compiledCircuit={WebappSettings.compiledCircuit}
        >
          {mounted && children}
        </AxiomCrosschainCircuitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

Everything else will stay the same as the standard query setup described above.

## Additional Reference

For full references on `AxiomCircuitProvider`, `AxiomCrosschainCircuitProvider`, `useAxiomCircuit`, and `useAxiomCrosschainCircuit`, see the [SDK Reference](/sdk/react-sdk/axiom-react.md).
