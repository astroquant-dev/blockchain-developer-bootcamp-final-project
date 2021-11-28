# Security measures


## Floating pragma (SWC-103)

A specific version of the Solidity compiler is used, namely 0.8.10, via

    pragma solidity 0.8.10;


## Use Modifiers Only for Validations

Modifiers should not perform any action besides ensuring that a condition has been met, e.g. in Shop.sol:

    modifier onlyOwner {
        require(msg.sender == contractOwner);
        _;
    }

## Reentrancy (SWC-107) and Checks-Effects-Interactions

Reentrancy attacks are produced when a malicious agent calls a contract function for a second time, when the first contract function hasn't finalised, with the intent of benefitting from it (e.g. receiving more funds than expected). 

Shop.sol and BlockchainArt.sol inherit OpenZeppelin's ReentrancyGuard lock.

In addition, the Check-Effects-Interactions has been implemented. This ensures that the contract function execution proceeds as follows:

- First, checks ensure that the function can run (e.g. only someone who doesn't already own an item can buy it, item is for sale)
- Second, internal state changes happen (e.g. is removed from listings)
- Third, external functions are called (NFT is transferred to buyer, ETH is transferred to seller)

This has been implemented in the function buyItem() in Shop.sol and also taken into account in safeMint() in BlockchainArt.sol.