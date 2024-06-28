---
description: VSCode Extension
sidebar_position: 1
sidebar_label: Axiom VSCode Extension
---

# Axiom VSCode Extension

This extension, built by [Standard Crypto](https://standardcrypto.vc), provides tools to manage compilation, proving, and query construction from an Axiom circuit in VSCode.  You can view the source code on [Github](https://github.com/standard-crypto/axiom-vscode). 

## Installation

Install the `Axiom Crypto` extension from [VisualStudio marketplace](https://marketplace.visualstudio.com/items?itemName=standard-crypto.axiom-crypto) within VSCode.

## Extension Settings

The extension has the following settings:

* `axiom.configFilePath`: File in which `PRIVATE_KEY_11155111` and `RPC_URL_11155111` are defined. Default is `.env`.
* `axiom.circuitFilesPattern`: Glob pattern to used to automatically discover files containing circuit definitions. Default is `**/axiom/**/*.ts`.
* `axiom.buildDirectory`: Path where circuit outputs from compiled circuits will be written. Default is `build/axiom`.

## Features

Axiom-VScode offers a user-friendly view for managing your Axiom circuit and its queries. 

### Managing Circuits

Circuits are loaded from a specified location using a customizable glob pattern in the [extension settings](#extension-settings). The circuit name is extracted from the circuit file.

#### Compile a Circuit

Compilation requires that the default input be set. 

The output will be written to the directory set in the [extension settings](#extension-settings).
![Compile Circuit Example](@site/static/img/vscode_compile_circuit.gif)

### Managing Queries

Queries are managed by Axiom-VScode and saved to the VS code workspace state. 

#### Add a query
![Add Query Example](@site/static/img/vscode_add_query.gif)

#### Proving queries

You must compile the circuit and set the query input before running.

You must also set `RPC_URL_11155111` in the config file defined in the [extension settings](#extension-settings).

![Prove Query Example](@site/static/img/vscode_prove_query.gif)

#### Sending queries

You must set the callback address before sending.

You must also set `PRIVATE_KEY_11155111` in the config file defined in the [extension settings](#extension-settings).

![Send Query Example](@site/static/img/vscode_send_query.gif)
