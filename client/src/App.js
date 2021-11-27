import React, { Component } from "react";

import { ethers } from 'ethers';

import * as fetch from 'node-fetch';

// import Web3Modal from "web3modal"
// import SimpleStorageContract from "./contracts/SimpleStorage.json";
import Shop from "./contracts/Shop.json";
import BlockChainArt from "./contracts/BlockChainArt.json";
// import getWeb3 from "./getWeb3";
import Web3Modal from 'web3modal'
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Figure from 'react-bootstrap/Figure'
import 'bootstrap/dist/css/bootstrap.min.css';

import "./App.css";

class App extends Component {
    state = { storageValue: 0, web3: null, account: null, shopContract: null, artContract: null, shopOwner: null, artOwner: null };

    fetchListedItems = async () => { const shopResponse = await this.state.shopContract.fetchListedItems(); console.log(shopResponse); return shopResponse; }
    mintNFT = async () => { await this.state.artContract.connect(this.state.signer).safeMint({ value: ethers.utils.parseUnits('0.055', 'ether') }); };
    buyNFT = async function (artId, price) { await this.state.shopContract.connect(this.state.signer).buyItem(artId, { value: price }) };

    componentDidMount = async () => {
        try {

            // const shopaddress = "0xbe5313dD5FF8A40b90803ccC3Ec1BDF665eB8D98";
            // const artaddress = "0xcFa1a0Fca921E80604B170FA4cE162DfD632bCC2";
            const shopaddress = "0xf7459bb090cCe1A6FA0803bcE59Bd0B2BdAf0477";
            const artaddress = "0xA8a90e950d8dee385b58751fD590e2327AeD88ef";

            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const networkName = (await provider.getNetwork()).name;

            const signer = await provider.getSigner();
            const account = await signer.getAddress();

            const shopContract = new ethers.Contract(shopaddress, Shop.abi, signer);
            const artContract = new ethers.Contract(artaddress, BlockChainArt.abi, signer);

            // await artContract.connect(signer).safeMint({ value: ethers.utils.parseUnits('0.055', 'ether') });
            // await artContract.connect(signer).safeMint({ value: ethers.utils.parseUnits('0.055', 'ether') });
            // await artContract.connect(signer).safeMint({ value: ethers.utils.parseUnits('0.055', 'ether') });
            // await artContract.connect(signer).safeMint({ value: ethers.utils.parseUnits('0.055', 'ether') });
            // await artContract.connect(signer).safeMint({ value: ethers.utils.parseUnits('0.055', 'ether') });

            // shopContract.connect(signer).listItem(artContract.address, 0, ethers.utils.parseUnits('1.5', 'ether'), "I am therefore I am too");
            // shopContract.connect(signer).listItem(artContract.address, 1, ethers.utils.parseUnits('1.5', 'ether'), "I am therefore I am too");
            // shopContract.connect(signer).listItem(artContract.address, 2, ethers.utils.parseUnits('1.5', 'ether'), "I think therefore I am too");
            // shopContract.connect(signer).listItem(artContract.address, 3, ethers.utils.parseUnits('1.5', 'ether'), "I think therefore I am three");

            const listedItems = await shopContract.fetchListedItems();
            let settings = { method: "Get" };

            const uriMap = new Map();
            for await (var entry of listedItems.entries()) {
                let tokenId = entry[1].tokenId;
                let tokenURI = await artContract.tokenURI(tokenId);
                console.log(tokenURI);
                console.log(tokenId);

                let q = await fetch(tokenURI, settings);
                let json = await q.json();
                uriMap.set(tokenId, json['image']);
                // fetch(tokenURI, settings)
                //     .then(res => res.json())
                //     .then((json) => {
                //         uriMap.set(String(0), json['image']);
                //     });
            }

            console.log(uriMap);

            const lists = listedItems.map(item => {
                return {
                    'artId': item.artId,
                    'currentOwner': item.currentOwner,
                    'tokenId': item.tokenId,
                    'tokenURI': uriMap.get(item.tokenId),
                    'nftContract': item.currentOwner,
                    'price': item.price / 1e18,
                    'priceOriginal': item.price
                };
            })

            console.log(lists);


            this.setState({ web3: web3Modal, signer: signer, account: account, shopContract: shopContract, networkName: networkName, artContract: artContract, listedItems: listedItems, lists: lists, shopOwner: null, artOwner: null }, this.runExample);
        } catch (error) {
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };



    runExample = async () => {
        const { accounts, shopContract, artContract } = this.state;
        const shopResponse = await shopContract.owner();
        const artResponse = await artContract.owner();
        console.log('shop owner is ' + shopResponse);
        console.log('art owner is ' + artResponse);
        this.setState({ shopOwner: shopResponse, artOwner: artResponse });
    };

    render() {
        if (!this.state.web3) {
            return <div>Loading Web3, accounts, and contract... make sure you're connected to Rinkeby on MetaMask</div>;
        }
        console.log('this.shopOwner=' + this.shopOwner);
        console.log('this.artOwner=' + this.artOwner);




        return (
            <div className="App">
                <Container fluid>

                    <h1>NFT marketplace</h1>
                    <p>The network is {this.state.networkName}</p>
                    <p>The shop contract ({this.state.shopContract.address}) owner is {this.state.shopOwner}</p>
                    <p>The art contract ({this.state.artContract.address}) owner is {this.state.artOwner}</p>

                    <h2>Listed items</h2>
                    {/* { namesList } */}
                    <Row xs={1} md={2} className="g-4">
                        {this.state.lists.map((_, idx) => (
                            <Col>
                                <Card>
                                    {/* <Card.Img variant="top" src={_.tokenURI} thumbnail /> */}
                                    <Card.Body>
                                        <Card.Header>
                                            <Card.Title>
                                                {_.artId}
                                            </Card.Title>
                                            <Card.Subtitle>Price: {_.price} ETH</Card.Subtitle>
                                            <Figure>
                                                <Figure.Image src={_.tokenURI} />
                                                {/* <Figure.Caption>
                                           {_.artId}
                                        </Figure.Caption> */}
                                            </Figure>
                                        </Card.Header>
                                        <Card.Text>
                                            Owned by {_.currentOwner}
                                        </Card.Text>
                                        <Card.Footer>
                                            <Button value="Buy!" onClick={() => { this.buyNFT(_.artId, _.priceOriginal) }}>Buy now</Button>
                                        </Card.Footer>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* <button onClick={this.fetchListedItems}> Activate Lasers </button> */}
                    {/* <button onClick={this.mintNFT}> Mint NFT! </button> */}
                </Container>
            </div>
        );
    }
}

export default App;
