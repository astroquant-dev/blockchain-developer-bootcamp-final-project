const ethers = require("ethers");
const shop = await Shop.deployed();
const art = await BlockchainArt.deployed()


const artAddress = art.address;
const shopAddress = shop.address;

q = await art.safeMint({ value: ethers.utils.parseUnits('0.0001', 'ether') });
tokenId = q['logs'][2]['args']['tokenId']['words'][0];
await shop.listItem(artAddress, tokenId, ethers.utils.parseUnits((0.0001*(1.0+tokenId*1.0)), 'ether'), "Artwork " + tokenId);




Shop.deployed().then((shop) => {
    console.log(shop.address);
});



q = async () =>  {
    let shop = await Shop.deployed();
}


function resolveAfter2Seconds() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('resolved');
      }, 2000);
    });
}
  
  async function asyncCall() {
    console.log('calling');
    const result = await resolveAfter2Seconds();
    console.log(result);
    // expected output: "resolved"
  }
  
  asyncCall();
  
