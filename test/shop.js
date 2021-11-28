const truffleAssert = require('truffle-assertions');
const Shop = artifacts.require("./Shop.sol");
const BlockchainArt = artifacts.require("./BlockchainArt.sol");

//https://github.com/dabit3/polygon-ethereum-nextjs-marketplace/blob/main/test/sample-test.js
//https://github.com/devpavan04/cryptoboys-nft-marketplace/blob/main/src/contracts/CryptoBoys.sol
//https://ethereum.stackexchange.com/questions/67097/returns-tx-object-instead-result-in-truffle-test
contract("Shop owner", async accounts => {

    mintPrice = web3.utils.toWei("0.05", "ether");

    it("...Shop should be owned by sender",  async ()  => {
        const shop = await Shop.deployed();
        const account = await accounts[0];
        const owner = await shop.owner();
        assert.equal(owner, account, "Shop not owned by sender");
    });

    it("...BlockchainArt should be owned by Shop",  async () =>  {

        const shop = await Shop.new();
        const art = await BlockchainArt.new(shop.address, "A", "B", mintPrice, "C");
        const artOwner = await art.owner();
        assert.equal(artOwner, shop.address, "BlockchainArt not owned by shop");

    });


    it("...NFT should be owned by sender",  async () =>  {
        const shop = await Shop.new();
        const art = await BlockchainArt.new(shop.address, "A", "B", mintPrice, "C");
        const artOwner = await art.owner();
        await art.safeMint.sendTransaction({ from: accounts[0], value: web3.utils.toWei("0.055","ether")});
        const nftOwner = await art.ownerOf(0);
        assert.equal(accounts[0], nftOwner, "Minted NFT not owned by sender");
    });


    it("...NFT should be owned by buyer",  async () =>  {
        let mintPrice = web3.utils.toWei("0.05", "ether");
        const shop = await Shop.new();
        const art = await BlockchainArt.new(shop.address, "A", "B", mintPrice, "C");
        const artOwner = await art.owner();
        let _1 = await art.safeMint.sendTransaction({ from: accounts[2], value: web3.utils.toWei("0.055","ether")})
        let _2 = await art.safeMint.sendTransaction({ from: accounts[2], value: web3.utils.toWei("0.05","ether")});
        let item1 = (await shop.listItem.sendTransaction(art.address, 0, web3.utils.toWei(web3.utils.toBN(1),"ether"), "1", { from: accounts[2]})).receipt.logs[0].args['artId'];
        let item2 = (await shop.listItem.sendTransaction(art.address, 1, web3.utils.toWei(web3.utils.toBN(1),"ether"), "1", { from: accounts[2]})).receipt.logs[0].args['artId'];

        await shop.buyItem.sendTransaction(item1, { from: accounts[3], value: web3.utils.toWei(web3.utils.toBN(1),"ether")});
        await shop.buyItem.sendTransaction(item2, { from: accounts[3], value: web3.utils.toWei(web3.utils.toBN(1),"ether")});
   
        let nftOwner0_1 = await art.ownerOf(0);
        assert.equal(accounts[3], nftOwner0_1, "NFT not owned by buyer");
        const nftOwner1_1 = await art.ownerOf(1);
        assert.equal(accounts[3], nftOwner1_1, "NFT not owned by buyer");
    });

    it("...NFT cannot be listed by anyone other than owner", async () => {
        let mintPrice = web3.utils.toWei("0.05", "ether");
        const shop = await Shop.new();
        const art = await BlockchainArt.new(shop.address, "A", "B", mintPrice, "C");
        const artOwner = await art.owner();
        let _1 = await art.safeMint.sendTransaction({ from: accounts[2], value: web3.utils.toWei("0.055","ether")})
        await truffleAssert.reverts(shop.listItem.sendTransaction(art.address, 0, web3.utils.toWei(web3.utils.toBN(1),"ether"), "1", { from: accounts[3]}), "Sender is not owner");
    });

    it("...NFT cannot be bought by owner", async () => {
        let mintPrice = web3.utils.toWei("0.05", "ether");
        const shop = await Shop.new();
        const art = await BlockchainArt.new(shop.address, "A", "B", mintPrice, "C");
        const artOwner = await art.owner();
        let _1 = await art.safeMint.sendTransaction({ from: accounts[2], value: web3.utils.toWei("0.055","ether")})
        let item1 = (await shop.listItem.sendTransaction(art.address, 0, web3.utils.toWei(web3.utils.toBN(1),"ether"), "1", { from: accounts[2]})).receipt.logs[0].args['artId'];
        await truffleAssert.reverts(shop.buyItem.sendTransaction(item1, { from: accounts[2], value: web3.utils.toWei(web3.utils.toBN(1),"ether")}), "Sender already owns token");

    });

    it("...NFT cannot be bought for less than listing price", async () => {
        let mintPrice = web3.utils.toWei("0.05", "ether");
        const shop = await Shop.new();
        const art = await BlockchainArt.new(shop.address, "A", "B", mintPrice, "C");
        const artOwner = await art.owner();
        let _1 = await art.safeMint.sendTransaction({ from: accounts[2], value: web3.utils.toWei("0.055","ether")})
        let item1 = (await shop.listItem.sendTransaction(art.address, 0, web3.utils.toWei(web3.utils.toBN(1),"ether"), "1", { from: accounts[2]})).receipt.logs[0].args['artId'];
        await truffleAssert.reverts(shop.buyItem.sendTransaction(item1, { from: accounts[3], value: web3.utils.toWei("0.99","ether")}), "Value sent is too low");
    });

    it("...NFT cannot be minted with less than minting price",  async () =>  {
        const shop = await Shop.new();
        const art = await BlockchainArt.new(shop.address, "A", "B", mintPrice, "C");
        truffleAssert.reverts(art.safeMint.sendTransaction({ from: accounts[2], value: web3.utils.toWei("0.04","ether")}), "Value paid is too low");
    });


})

