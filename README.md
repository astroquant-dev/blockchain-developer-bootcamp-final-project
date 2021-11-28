# Project description

The project implements an NFT gallery where different artworks can be listed for purchase.

In practice, there are two contracts that have been set up:
- `Shop`, the NFT gallery, where digital artworks can either be listed by their owners at a given price, and purchased by the public for that price.
- `BlockchainArt`, an ERC721 contract that can be used as an example of an artwork contract which the public can mint for a set price (0.0001 ETH in our case). 

For simplicity, the base ERC721 tokenURI for `BlockchainArt` has been prepopulated with a set of publicly-available artworks on Pinata Cloud. The deployment follows:

    var BlockchainArt = artifacts.require("./BlockchainArt.sol");
    var Shop = artifacts.require("./Shop.sol");

    module.exports = async function(deployer) {
        deployer.deploy(Shop).then(function(){
            return deployer.deploy(BlockchainArt, Shop.address, "BlockchainArt", "BCA", web3.utils.toWei("0.0001","ether"), "https://gateway.pinata.cloud/ipfs/QmSp4boAHp9J7h7wMZutZkiJkcTN8MraW3BiMUSxoP27cs/")});
    };









# Technical details, instructions, testing

## Public URL
[https://blockchainart.herokuapp.com/](https://blockchainart.herokuapp.com/). Free Heroku instances take about 30 seconds to boot up, please be patient.

## Deployed contracts
Network: Rinkeby

BlockchainArt: `0xb9FC8a3fF1b09c50AbE74E4816003a8C5dF36b7a`

Shop: `0x6559CFFc7CF4d7a00cC393b9A71a43A1deB7F3Eb`

## Directory structure

- `client`: web frontend, written in React
- `contracts`: smart contracts that have been created as part of this project
- `migrations`: functionality that deploys the smart contracts in the desired network
- `test`: smart contract tests

## Setup

Running `yarn install` from the root project folder will install all packages and dependencies required, assuming Node.js >= v14, yarn, truffle, ganache-cli are present. 

The local ganache-cli (note port 8545) and remote rinkeby networks are defined in the truffle-config.js file:

        development: {
        host: "127.0.0.1",     // Localhost (default: none)
        port: 8545,            // Standard Ethereum port (default: none)
        network_id: "*",       // Any network (default: none)
        },
        rinkeby: {
            provider: () => new HDWalletProvider(process.env.MNEMONIC, process.env.INFURA_URL),
            network_id: 4,       
            gas: 5500000,        // Ropsten has a lower block limit than mainnet
        },

The file .env in the root project folder should be populated as such, in order to replicate the connection to rinkeby via Infura, if need be:

> INFURA_URL="https://rinkeby.infura.io/v3/[infura key]"

> MNEMONIC="mnemonic phrase here"


## Compiling and testing

In order to compile the contracts locally and migrate them to the local ganache instance (make sure it's running!), run
> truffle migrate --compile-all --reset --network development

For testing, run
> truffle test --show-events  --debug --network development

In order to compile and test on the rinkeby network, replace `--network development` with `--network rinkeby` above.

## Running the frontend client locally

Ensure that the contract addresses defined in client/src/App.js point to the lcoally deployed contracts - modify the following lines in that file:

    const shopAddress = "enter contract address here";
    const artAddress = "enter contract address here";

Ensure that metamask points to the local ganache instance.

The client runs under the folder `client/`. Run
    cd client
    yarn install
    yarn start

The client will appear on [http://localhost:3000/](http://localhost:3000/).


## Populating the listings and buying items

### Populating the listings

Start by running `truffle console --network development` ensuring that ganache-cli is still running, then run, one line at a time:

    const ethers = require("ethers");
    const shop = await Shop.deployed();
    const art = await BlockchainArt.deployed();
    const artAddress = art.address;
    const shopAddress = shop.address;


The following set of lines can be run a number of times, to populate the NFT listings:

    q = await art.safeMint({ value: ethers.utils.parseUnits('0.0001', 'ether') });
    tokenId = q['logs'][2]['args']['tokenId']['words'][0];
    await shop.listItem(artAddress, tokenId, ethers.utils.parseUnits(String(0.0001*(1+v)), 'ether'), "Artwork " + tokenId);

The first line mints a new NFT from the BlockchainArt contract. The second line fetches the tokenId for the minted token from the BlockchainArt.Minted event. The third line lists said tokenId in the Shop.

Ensure there is ETH in the local address.

### Buying items

Open the browser and go to the local project URL. Make sure Metamask is installed, the localhost:8545 network is selected, and a different account to the one used for minting is chosen. After the listings are populated as above, a number of items will appear. By clicking on 'Buy now' under an item, the contract call buyItem will be triggered and the amount of ETH will be transferred.



## Screencast recording
[https://](https://)
## Ethereum address for certification
xxxxxx


