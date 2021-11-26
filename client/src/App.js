import React, { Component } from "react";
import { ethers } from 'ethers'
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
            const shopaddress = "0x8536fb5B72d881B6e1D8e377B4dcfdEC31Cf253B";
            const artaddress = "0x7a212C37d024a6409D9A5531E1d4e911dfF26185";
            
            console.log("Art")
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


            const lists = listedItems.map(item => {
                return {
                    'artId': item.artId,
                    'currentOwner': item.currentOwner,
                    'tokenId': item.tokenId,
                    'nftContract': item.currentOwner,
                    'price': item.price / 1e18,
                    'priceOriginal': item.price
                };
            })


            console.log(lists)


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
            return <div>Loading Web3, accounts, and contract...</div>;
        }
        console.log('this.shopOwner=' + this.shopOwner);
        console.log('this.artOwner=' + this.artOwner);




        return (
            <div className="App">
                <Container fluid>

                    <h1>NFT marketplace</h1>
                    <b>Make sure your network is set to Rinkeby</b>
                    <p>The network is {this.state.networkName}</p>
                    <p>The shop contract owner is {this.state.shopOwner}</p>
                    <p>The art contract owner is {this.state.artOwner}</p>
                    
                    <h2>Listed items</h2>
                    {/* { namesList } */}
                    <Row xs={1} md={2} className="g-4">
                        {this.state.lists.map((_, idx) => (
                            <Col>
                                <Card>
                                    {/* <Card.Img variant="top" src="holder.js/100px160" /> */}
                                    <Card.Body>
                                        <Card.Header>
                                            <Card.Title>
                                                {_.artId}
                                            </Card.Title>
                                            <Card.Subtitle>Price: {_.price} ETH</Card.Subtitle>
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
