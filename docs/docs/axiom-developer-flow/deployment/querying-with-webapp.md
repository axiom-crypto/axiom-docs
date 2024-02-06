---
description: Sending queries in your webapp
sidebar_position: 1
sidebar_label: Querying in Your Webapp
---

# Sending Queries in Your Webapp

This tutorial gives an explanation of what's happening as we run . It assumes that you've already run `npx create-axiom-client` and selected the Next.js option to build a Next.js webapp scaffold.

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

You can then follow the on-screen directions to build and send a query. The following sections describe different parts of the Next.js webapp, so you can modify them as needed.

## The `AxiomProvider` wrapper for `AxiomCircuitProvider`

The `app/src/app/axiomProvider.tsx` file contains an `AxiomProvider` wrapper for the `AxiomCircuitProvider` that's exported from `@axiom-crypto/react`. This `AxiomProvider` component is used to prevent hydration errors when `AxiomCircuitProvider` is mounting.

```typescript title="app/src/app/axiomProvider.tsx"
"use client";

import { useEffect, useState } from "react";
import { AxiomCircuitProvider } from "@axiom-crypto/react";
import compiledCircuit from "../../axiom/data/compiled.json";

export default function AxiomProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <AxiomCircuitProvider
      compiledCircuit={compiledCircuit}
      provider={process.env.NEXT_PUBLIC_PROVIDER_URI_SEPOLIA as string}
      chainId={"11155111"}
    >
      {mounted && children}
    </AxiomCircuitProvider>
  );
}
```

`<AxiomProvider>` is then inserted into `layout.tsx`, around `{children}`.

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
          <AxiomProvider>
            {children}
          </AxiomProvider>
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
import jsonInputs from "../../../axiom/data/inputs.json";

export default function BuildQuery({
  inputs,
  callbackAddress,
  callbackExtraData,
  refundee,
}: {
  inputs: UserInput<typeof jsonInputs>;
  callbackAddress: string;
  callbackExtraData: string;
  refundee: string;
}) {
  const {
    build,
    builtQuery,
    setParams,
    areParamsSet,
  } = useAxiomCircuit<typeof jsonInputs>();

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
  const { data } = useSimulateContract(builtQuery!);
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

## Additional Reference

For full references on `AxiomCircuitProvider` and `useAxiomCircuit`, see the [SDK Reference](/sdk/react-sdk/axiom-react.md).
