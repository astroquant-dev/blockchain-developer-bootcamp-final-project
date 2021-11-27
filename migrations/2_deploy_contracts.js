var BlockchainArt = artifacts.require("./BlockchainArt.sol");
var Shop = artifacts.require("./Shop.sol");

module.exports = async function(deployer) {
    deployer.deploy(Shop).then(function(){
        return deployer.deploy(BlockchainArt, Shop.address, "BlockchainArt", "BCA", web3.utils.toWei("0.0001","ether"), "https://gateway.pinata.cloud/ipfs/QmSp4boAHp9J7h7wMZutZkiJkcTN8MraW3BiMUSxoP27cs/")});
};
