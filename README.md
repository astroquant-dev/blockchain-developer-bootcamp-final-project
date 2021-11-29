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

BlockchainArt: `0xBd84Ab0412cb1DB89B1A42c849e0BD12b4e55daD`

Shop: `0xCDb89cB170477b969aCD3C36afe3844B872579e2`

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


The following set of lines can be run a number of times, to populate the NFT listings, using a different account to mint the token each time (again, you may need to run one line at a time):

    art.safeMint({ value: ethers.utils.parseUnits('0.0001', 'ether') }).then((tx) => { return parseInt(tx.logs.filter((v) => { return v.event == "Minted" })[0]['args']['tokenId']) }).then((tokenId) => { return shop.listItem(artAddress, tokenId, ethers.utils.parseUnits(String(0.0001), 'ether'), "Artwork " + tokenId) });

    art.safeMint({ value: ethers.utils.parseUnits('0.0001', 'ether'), from: accounts[1] }).then((tx) => { return parseInt(tx.logs.filter((v) => { return v.event == "Minted" })[0]['args']['tokenId']) }).then((tokenId) => { return shop.listItem(artAddress, tokenId, ethers.utils.parseUnits(String(0.0001), 'ether'), "Artwork " + tokenId, {from: accounts[1]}) });

    art.safeMint({ value: ethers.utils.parseUnits('0.0001', 'ether'), from: accounts[2] }).then((tx) => { return parseInt(tx.logs.filter((v) => { return v.event == "Minted" })[0]['args']['tokenId']) }).then((tokenId) => { return shop.listItem(artAddress, tokenId, ethers.utils.parseUnits(String(0.0001), 'ether'), "Artwork " + tokenId, {from: accounts[2]}) });

    art.safeMint({ value: ethers.utils.parseUnits('0.0001', 'ether'), from: accounts[3] }).then((tx) => { return parseInt(tx.logs.filter((v) => { return v.event == "Minted" })[0]['args']['tokenId']) }).then((tokenId) => { return shop.listItem(artAddress, tokenId, ethers.utils.parseUnits(String(0.0001), 'ether'), "Artwork " + tokenId, {from: accounts[3]}) });

    art.safeMint({ value: ethers.utils.parseUnits('0.0001', 'ether'), from: accounts[4] }).then((tx) => { return parseInt(tx.logs.filter((v) => { return v.event == "Minted" })[0]['args']['tokenId']) }).then((tokenId) => { return shop.listItem(artAddress, tokenId, ethers.utils.parseUnits(String(0.0001), 'ether'), "Artwork " + tokenId, {from: accounts[4]}) });

    art.safeMint({ value: ethers.utils.parseUnits('0.0001', 'ether'), from: accounts[5] }).then((tx) => { return parseInt(tx.logs.filter((v) => { return v.event == "Minted" })[0]['args']['tokenId']) }).then((tokenId) => { return shop.listItem(artAddress, tokenId, ethers.utils.parseUnits(String(0.0001), 'ether'), "Artwork " + tokenId, {from: accounts[5]}) });


The first line mints a new NFT from the BlockchainArt contract. The second line fetches the tokenId for the minted token from the BlockchainArt.Minted event. The third line lists said tokenId in the Shop.

Ensure there is ETH in the local address.

### Buying items

Open the browser and go to the local project URL. Make sure Metamask is installed, the localhost:8545 network is selected, _and a different account to the one used for minting is chosen._ After the listings are populated as above, a number of items will appear. By clicking on 'Buy now' under an item, the contract call buyItem will be triggered and the amount of ETH will be transferred. If you access the page with the same account you used to mint some of the items, the buy button will be disabled.



## Screencast recording
[https://](https://)
## Ethereum address for certification
0x9bC08568a537c4b69a360B8826B6BEe22F1cf16E (mainnet)


