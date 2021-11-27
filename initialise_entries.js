const ethers = require("ethers");


(async () => {
const shop = await Shop.deployed();
const art = await BlockchainArt.deployed();

const artAddress = art.address;
const shopAddress = shop.address;


for  (let i = 0; i < 300; i++) {
    let q = await art.safeMint({ value: ethers.utils.parseUnits('0.0001', 'ether') });
    let k = q['logs'][2]['args']['tokenId']['words'][0];
    await shop.listItem(artAddress, i, ethers.utils.parseUnits(String(0.0001*(1+i)), 'ether'), "Artwork" + k);
};
})

    // q['logs'][2]['args']['tokenId']['words'][0]
