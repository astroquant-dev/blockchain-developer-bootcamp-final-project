import React, { Component } from "react";

import { ethers } from 'ethers';

import * as fetch from 'node-fetch';
// import Web3Modal from "web3modal"
// import SimpleStorageContract from "./contracts/SimpleStorage.json";
import Shop from "./contracts/Shop.json";
import BlockChainArt from "./contracts/BlockChainArt.json";
// import getWeb3 from "./getWeb3";
import Web3Modal from 'web3modal';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Figure from 'react-bootstrap/Figure';
import Alert from 'react-bootstrap/Alert';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";

// Rinkeby
const shopAddress = "0xb0df0B04be62ddcF556341420E80e0EFB235CbA9";
const artAddress = "0xE3fE89746062AAdC7B6e935B71F653368d75D482";

// Local 
// const shopAddress = "enter contract address here";
// const artAddress = "enter contract address here";



class App extends Component {
    state = { storageValue: 0, web3: null, account: null, shopContract: null, artContract: null, shopOwner: null, artOwner: null, boughtItem: "" };

    fetchListedItems = async () => { const shopResponse = await this.state.shopContract.fetchListedItems(); console.log(shopResponse); return shopResponse; }

    generateItemsList = async (shopContract, artContract) => {
        if (shopContract != null) {
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
                    'canBuy': item.currentOwner !== this.state.account,
                    'tokenId': item.tokenId,
                    'tokenURI': uriMap.get(item.tokenId),
                    'nftContract': item.currentOwner,
                    'price': item.price / 1e18,
                    'priceOriginal': item.price
                };
            })
            return lists;
        }
        else {
            return Map();
        }
    }


    mintNFT = async () => { await this.state.artContract.connect(this.state.signer).safeMint({ value: ethers.utils.parseUnits('0.055', 'ether') }); };

    // buyNFT = async function (artId, price) {
    //     this.setState({ boughtItem: '' });
    //     this.state.shopContract.connect(this.state.signer).buyItem(artId, { value: price }).then((value) => {
    //         this.setState({ boughtItem: 'Awaiting buyItem transaction ' + value.hash + '...' });
    //         return value.wait();
    //     }).then((vv) => {
    //         this.generateItemsList(this.state.shopContract, this.state.artContract).then((vvv) => this.setState({ lists: vvv, boughtItem: 'Item purchased!' }));
    //     });
    // };
    buyNFT = async function (artId, price) {
        this.setState({ boughtItem: '' });
        this.state.shopContract.connect(this.state.signer).buyItem(artId, { value: price }).then((value) => {
            this.setState({ boughtItem: <Alert variant='info'>{'Awaiting buyItem transaction ' + value.hash + '...'}</Alert> });
            return value.wait();
        }, (error) => { console.log(error); 
            let msg = 'data' in error ? error['data']['message'] : error['message'];
            this.setState({ boughtItem: <Alert variant='danger'>{msg}</Alert>});  }).then((vv) => {
            console.log(vv);
            if (vv != null)
                this.generateItemsList(this.state.shopContract, this.state.artContract).then((vvv) => this.setState({ lists: vvv, boughtItem: <Alert variant='success'>{'Item purchased!'}</Alert> }));
        });
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
            this.setState({ account: account });

            const lists = await this.generateItemsList(shopContract, artContract);

            this.setState({
                web3: web3Modal, signer: signer, account: account, shopContract: shopContract, networkName: networkName, lists: lists,
                artContract: artContract, shopOwner: null, artOwner: null
            }, this.runExample);


        } catch (error) {
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };



    runExample = async () => {
        const {  shopContract, artContract } = this.state;
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
                    <p>Your account is is {this.state.account}</p>
                    <p>The shop contract ({this.state.shopContract.address}) owner is {this.state.shopOwner}</p>
                    <p>The art contract ({this.state.artContract.address}) owner is {this.state.artOwner}</p>
                    {this.state.boughtItem}
                    {/* {
                        this.state.boughtItem == "Item purchased!"
                            ? <Alert variant='success'>{this.state.boughtItem}</Alert>
                            : <Alert variant='light'>{this.state.boughtItem}</Alert>
                    } */}

                    <h2>Listed items</h2>
                    <Row xs={1} md={2} className="g-4">
                        {this.state.lists.map((_, idx) => (
                            <Col key={idx}>
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
                                            {_.canBuy
                                                ? <Button value="Buy!" onClick={() => { this.buyNFT(_.artId, _.priceOriginal) }}>Buy now</Button>
                                                // : <Button value="Buy!" onClick={() => { this.buyNFT(_.artId, _.priceOriginal) }}>Buy now</Button>
                                                : <Button value="Cannot buy" disabled variant="secondary" >You already own this item, can't buy it!</Button>

                                            }
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
