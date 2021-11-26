var BlockchainArt = artifacts.require("./BlockchainArt.sol");
var Shop = artifacts.require("./Shop.sol");

module.exports = async function(deployer) {
    deployer.deploy(Shop).then(function(){
        return deployer.deploy(BlockchainArt, Shop.address, "BCart", "BCA", web3.utils.toWei("0.05","ether"), "https://blockchainart.herokuapp.com/")});



    // deployer.deploy(Shop);//.then(async () => { deployer.deploy(BlockchainArt, Shop.address, "BCart", "BCA", "https://blockchainart.herokuapp.com/") });



    // deployer.deploy(BlockchainArt, Shop.address, "BCart", "BCA", "https://blockchainart.herokuapp.com/");
    // deployer.deploy(Shop).then(function (instance) { deployer.deploy(BlockchainArt, instance.address, "BCart", "BCA", "https://blockchainart.herokuapp.com/")});
    // deployer.deploy(BlockchainArt);
    // let shopInstance = await Shop.deployed();
    // deployer.deploy(BlockchainArt(shopInstance.address, "My NFT", "NFT", "https://blockchainart.herokuapp.com/"));
};
