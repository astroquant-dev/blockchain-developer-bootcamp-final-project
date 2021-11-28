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

// Rinkeby
const shopAddress = "0x6559CFFc7CF4d7a00cC393b9A71a43A1deB7F3Eb";
const artAddress = "0xb9FC8a3fF1b09c50AbE74E4816003a8C5dF36b7a";

// Local 
// const shopAddress = "0x5eD6fdA623f53cfe08583762E801DCff00caf2E3";
// const artAddress = "0x41fE557618c9eC503f5bCc155E7f2088d72F3198";



class App extends Component {
    state = { storageValue: 0, web3: null, account: null, shopContract: null, artContract: null, shopOwner: null, artOwner: null };

    fetchListedItems = async () => { const shopResponse = await this.state.shopContract.fetchListedItems(); console.log(shopResponse); return shopResponse; }
    mintNFT = async () => { await this.state.artContract.connect(this.state.signer).safeMint({ value: ethers.utils.parseUnits('0.055', 'ether') }); };
    buyNFT = async function (artId, price) { 
        var buyResult = await this.state.shopContract.connect(this.state.signer).buyItem(artId, { value: price })

        console.log(buyResult);
    
    
    };

    componentDidMount = async () => {
        try {


            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const networkName = (await provider.getNetwork()).name;

            const signer = await provider.getSigner();
            const account = await signer.getAddress();

            const shopContract = new ethers.Contract(shopAddress, Shop.abi, signer);
            const artContract = new ethers.Contract(artAddress, BlockChainArt.abi, signer);

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

            }

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
        this.setState({ shopOwner: shopResponse, artOwner: artResponse });
    };

    render() {
        if (!this.state.web3) {
            return <div>Loading Web3, accounts, and contract... make sure you're connected to Rinkeby or local ganache development network on MetaMask</div>;
        }

        return (
            <div className="App">
                <Container fluid>

                    <h1>NFT marketplace</h1>
                    <p>The network is {this.state.networkName}</p>
                    <p>The shop contract ({this.state.shopContract.address}) owner is {this.state.shopOwner}</p>
                    <p>The art contract ({this.state.artContract.address}) owner is {this.state.artOwner}</p>

                    <h2>Listed items</h2>
                    <Row xs={1} md={2} className="g-4">
                        {this.state.lists.map((_, idx) => (
                            <Col>
                                <Card>
                                    <Card.Body>
                                        <Card.Header>
                                            <Card.Title>
                                                {_.artId}
                                            </Card.Title>
                                            <Card.Subtitle>Price: {_.price} ETH</Card.Subtitle>
                                            <Figure>
                                                <Figure.Image src={_.tokenURI} />
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
                </Container>
            </div>
        );
    }
}

export default App;
