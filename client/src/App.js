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
// const shopAddress = "0xCDb89cB170477b969aCD3C36afe3844B872579e2";
// const artAddress = "0xBd84Ab0412cb1DB89B1A42c849e0BD12b4e55daD";

// Local 
const shopAddress = "0x7cd6ec8E4BFF026429426d59b5aCFC42980F0EAc";
const artAddress = "0x9ae9c3FeAE5285d604aa96bb934636119780613e";



class App extends Component {
    state = { storageValue: 0, web3: null, account: null, shopContract: null, artContract: null, shopOwner: null, artOwner: null, boughtItem: ""};

    fetchListedItems = async () => { const shopResponse = await this.state.shopContract.fetchListedItems(); console.log(shopResponse); return shopResponse; }
    mintNFT = async () => { await this.state.artContract.connect(this.state.signer).safeMint({ value: ethers.utils.parseUnits('0.055', 'ether') }); };
    buyNFT = async function (artId, price) { 
        // var buyResult = await this.state.shopContract.connect(this.state.signer).buyItem(artId, { value: price })
        // console.log(buyResult);
    
        this.state.shopContract.connect(this.state.signer).buyItem(artId, { value: price }).then((value) => { this.setState({boughtItem: String(value)})});
        console.log(1);
        console.log(String(this.boughtItem));
        
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


            // https://ethereum.stackexchange.com/questions/91633/what-is-in-return-when-listening-to-an-event
            //     event NFTBought(address indexed nftContract, address indexed buyer, uint indexed tokenId);

            // shopContract.on('NFTBought', (nftContract, buyer, tokenId)


            const listedItems = await shopContract.fetchListedItems();
            let settings = { method: "Get" };

            const uriMap = new Map();
            for await (var entry of listedItems.entries()) {
                let tokenId = entry[1].tokenId;
                let tokenURI = await artContract.tokenURI(tokenId);

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
                    <p>Your account is is {this.state.account}</p>
                    <p>The shop contract ({this.state.shopContract.address}) owner is {this.state.shopOwner}</p>
                    <p>The art contract ({this.state.artContract.address}) owner is {this.state.artOwner}</p>
                    <p>Your account is is {this.state.boughtItem}</p>

                    <h2>Listed items</h2>
                    <Row xs={1} md={2} className="g-4">
                        {this.state.lists.map((_, idx) => (
                            <Col>
                                <Card>
                                    <Card.Body>
                                        <Card.Header>
                                            <Card.Title>
                                                ArtId: {_.artId}
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
