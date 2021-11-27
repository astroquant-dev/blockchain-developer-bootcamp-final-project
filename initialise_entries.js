const ethers = require("ethers");


const shop = await Shop.deployed();
const art = await BlockchainArt.deployed();

const artAddress = art.address;
const shopAddress = shop.address;

q = await art.safeMint({ value: ethers.utils.parseUnits('0.0001', 'ether') });
k = q['logs'][2]['args']['tokenId']['words'][0];
await shop.listItem(artAddress, k, ethers.utils.parseUnits(String(0.0001*(1+k)), 'ether'), "Artwork " + k);

