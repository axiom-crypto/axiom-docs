---
description: Solidity contract for the Autonomous Airdrop example
sidebar_position: 3
sidebar_label: Integrating Into Your App
---

# Integrating Into Your App

We specified our query in the [previous section](/docs/tutorial/client-circuit), so we are now ready to write and test our smart contract that will use the results of that query to decide whether a user is eligible for an airdrop. To do this, we will write an Axiom smart contract client.

## AutonomousAirdrop.sol

In our AutonomousAirdrop contract, we inherit `AxiomV2Client` and proceed to override the `_validateAxiomV2Call` and `_axiomV2Callback` functions in order for us to do our validation on the callback.

```solidity title="src/AutonomousAirdrop.sol"
pragma solidity 0.8.19;

import { IERC20 } from "@openzeppelin-contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin-contracts/access/Ownable.sol";

import { AxiomV2Client } from "@axiom-crypto/v2-periphery/client/AxiomV2Client.sol";

contract AutonomousAirdrop is AxiomV2Client, Ownable {
    event ClaimAirdrop(address indexed user, uint256 indexed queryId, uint256 numTokens, bytes32[] axiomResults);
    event ClaimAirdropError(address indexed user, string error);
    event AxiomCallbackQuerySchemaUpdated(bytes32 axiomCallbackQuerySchema);
    event AirdropTokenAddressUpdated(address token);

    bytes32 public constant SWAP_EVENT_SCHEMA = 0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67;
    address public constant UNIV3_POOL_UNI_WETH = 0x224Cc4e5b50036108C1d862442365054600c260C;
    uint32 public constant MIN_BLOCK_NUMBER = 4000000;

    uint64 public callbackSourceChainId;
    bytes32 public axiomCallbackQuerySchema;
    mapping(address => bool) public querySubmitted;
    mapping(address => bool) public hasClaimed;

    IERC20 public token;

    constructor(address _axiomV2QueryAddress, uint64 _callbackSourceChainId, bytes32 _axiomCallbackQuerySchema)
        AxiomV2Client(_axiomV2QueryAddress)
    {
        callbackSourceChainId = _callbackSourceChainId;
        axiomCallbackQuerySchema = _axiomCallbackQuerySchema;
    }

    function updateCallbackQuerySchema(bytes32 _axiomCallbackQuerySchema) public onlyOwner {
        axiomCallbackQuerySchema = _axiomCallbackQuerySchema;
        emit AxiomCallbackQuerySchemaUpdated(_axiomCallbackQuerySchema);
    }

    function updateAirdropToken(address _token) public onlyOwner {
        token = IERC20(_token);
        emit AirdropTokenAddressUpdated(_token);
    }

    function _axiomV2Callback(
        uint64, /* sourceChainId */
        address callerAddr,
        bytes32, /* querySchema */
        uint256 queryId,
        bytes32[] calldata axiomResults,
        bytes calldata /* extraData */
    ) internal virtual override {
        require(!hasClaimed[callerAddr], "Autonomous Airdrop: User has already claimed this airdrop");

        // Parse results
        address userEventAddress = address(uint160(uint256(axiomResults[0])));
        uint32 blockNumber = uint32(uint256(axiomResults[1]));
        address uniV3PoolUniWethAddr = address(uint160(uint256(axiomResults[2])));

        // Validate the results
        require(userEventAddress == callerAddr, "Autonomous Airdrop: Invalid user address for event");
        require(
            blockNumber >= MIN_BLOCK_NUMBER,
            "Autonomous Airdrop: Block number for transaction receipt must be 4000000 or greater"
        );
        require(
            uniV3PoolUniWethAddr == UNIV3_POOL_UNI_WETH,
            "Autonomous Airdrop: Address that emitted `Swap` event is not the UniV3 UNI-WETH pool address"
        );

        // Transfer tokens to user
        hasClaimed[callerAddr] = true;
        uint256 numTokens = 100 * 10 ** 18;
        token.transfer(callerAddr, numTokens);

        emit ClaimAirdrop(callerAddr, queryId, numTokens, axiomResults);
    }

    function _validateAxiomV2Call(
        AxiomCallbackType, /* callbackType */
        uint64 sourceChainId,
        address, /* caller  */
        bytes32 querySchema,
        uint256, /* queryId */
        bytes calldata /* extraData */
    ) internal virtual override {
        require(sourceChainId == callbackSourceChainId, "AutonomousAirdrop: sourceChainId mismatch");
        require(querySchema == axiomCallbackQuerySchema, "AutonomousAirdrop: querySchema mismatch");
    }
}
```

### `_validateAxiomV2Call`

In our present contract `AutonomousAirdrop`, we override `_validateAxiomV2Call` so that the `sourceChainId`, which identifies the chain that the data in our query comes from, is equal to an immutable `SOURCE_CHAIN_ID`. Moreover, since `AxiomV2Query` processes queries from many different clients, we ensure that the `AutonomousAirdrop` only accepts queries we wrote by enforcing that the `querySchema` equals a `QUERY_SCHEMA` we set upon construction. This `QUERY_SCHEMA` is given to us when we [compiled](/docs/axiom-developer-flow/axiom-client-circuit.md#compile) our circuit.

### `_axiomV2Callback`

This is where we actually do something with the `axiomResults` from the fulfilled query. The results are given in a generic format as `bytes32[]`, so we must parse them to regain context. This requires sync-ing between the circuit code in `app/axiom/swapEvent.circuit.ts` and our smart contract code. In our circuit code we specified that the results added to the callback were `[swapTo, inputs.blockNumber, receiptAddr]`, so we now parse them accordingly in `_axiomV2Callback`.

Note that we took special care in parsing `axiomResults[2]` to `address` due to the way zero padding works in Solidity for `uint160` vs `bytes20`.

After parsing the `axiomResults`, we validate them before transfering the airdrop tokens to the user.
Lastly we emit the `ClaimAirdrop` event.
