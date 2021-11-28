// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./BlockchainArt.sol";

contract Shop is IERC721Receiver, ReentrancyGuard {
    address payable private contractOwner;
    mapping(address=>mapping(uint=>uint)) prices;
    mapping(uint=>address) private owners;
    mapping(bytes32=>ArtItem) artItems;
    mapping(bytes32=>uint) artIdToIndex;
    bytes32[] artIds;
    

    using Counters for Counters.Counter;
    Counters.Counter private  artIdCounter;
    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _soldArtIdCounter;

    event NFTMinted(address indexed nftContract);
    event ShopCreated(address indexed contractOwner);
    event NFTToBeBought(bytes32 artId);
    event NFTBought(address indexed nftContract, address indexed buyer, uint indexed tokenId);
    event NFTListed(bytes32 indexed artId, address indexed nftcontract, uint indexed tokenId, address sender);
    struct ArtItem {
        bytes32 artId;
        address nftContract;
        address currentOwner;
        uint tokenId;
        string title;
        uint price;
        bool forSale;
    }


    modifier onlyOwner {
        require(msg.sender == contractOwner);
        _;
    }
    constructor() {
        contractOwner = payable(msg.sender);
        emit ShopCreated(contractOwner);
    }

    function hash1(address nftContract, uint tokenId) internal view returns(bytes32) {
       return keccak256(abi.encodePacked(nftContract, tokenId));
    }

    function buyItem(bytes32 artId) payable public {

        ArtItem storage artItem = artItems[artId];
        address owner = IERC721(artItem.nftContract).ownerOf(artItem.tokenId);
        uint tokenId = artItem.tokenId;
        address nftContract = artItem.nftContract;

        require(owner != msg.sender, "Sender already owns token");
        require(artItem.forSale, "NFT not for sale");
        require(msg.value >= artItem.price, "Value sent is too low");
        require(msg.sender != address(0), "Sender is not null");
        require(artItem.currentOwner != address(0), "Owner is not null");
        // delete artItems[artId];
        removeItem(artId);
        IERC721(nftContract).safeTransferFrom(owner, msg.sender, tokenId);
        payable(owner).call{value: msg.value}('');
        emit NFTBought(nftContract, msg.sender, tokenId);

    }

    function listItem(address nftContract, uint tokenId, uint price, string memory title) public returns (bytes32) {
        address owner = IERC721(nftContract).ownerOf(tokenId);
        require(owner == msg.sender, "Sender is not owner");
        bytes32 artId = hash1(nftContract, tokenId);
        ArtItem storage artItem = artItems[artId];
        require(artItem.forSale == false, "Item already listed");

        // artItems[artId] = ArtItem(artId, nftContract, owner, tokenId, title, price, true);
        addItem(artId, nftContract, owner, tokenId, title, price);
        emit NFTListed(artItem.artId, artItem.nftContract, artItem.tokenId, msg.sender);
        return artItem.artId;
    }

    function addItem(bytes32 artId, address nftContract, address owner, uint tokenId, string memory title, uint price) internal {
        artIdCounter.increment();
        if (artItems[artId].forSale == false) {
            artItems[artId] = ArtItem(artId, nftContract, owner, tokenId, title, price, true);
            artIdToIndex[artId] = artIds.length;
            artIds.push(artId);
        }
    }

    function removeItem(bytes32 artId) internal {
        _soldArtIdCounter.increment();
        if (artItems[artId].forSale) {
           delete artItems[artId];
           delete artIds[artIdToIndex[artId]];
           delete artIdToIndex[artId];
        }
    }

    function fetchListedItems() public view returns (ArtItem[] memory) {
        ArtItem[] memory items = new ArtItem[](artIdCounter.current() - _soldArtIdCounter.current());

        uint j = 0;
        for (uint i = 0; i < artIdCounter.current(); i++) {
            if (artItems[artIds[i]].forSale) {
                items[j] = artItems[artIds[i]];
                j++;
            }
        }
        return items;
    }



    function owner() public view returns (address) {
        return contractOwner;
    }

    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }





}

