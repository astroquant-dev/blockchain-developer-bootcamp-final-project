// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./BlockchainArt.sol";

/** @title NFT gallery.shop
    @author astroquant-dev
    @notice Contract keeps track of artwork listings and allows users to purchase them */
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
    event NFTBought(address indexed nftContract, address indexed buyer, bytes32 indexed artId);
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

    /** @notice Purchase artwork artId
        @dev artId is unique per contract address and tokenId. Emits NFTBought
        @param artId Unique identifier for a listed artwork */
    function buyItem(bytes32 artId) payable public {

        ArtItem storage artItem = artItems[artId];
        address _owner = IERC721(artItem.nftContract).ownerOf(artItem.tokenId);
        uint tokenId = artItem.tokenId;
        address nftContract = artItem.nftContract;

        require(_owner != msg.sender, "Sender already owns token");
        require(artItem.forSale, "NFT not for sale");
        require(msg.value >= artItem.price, "Value sent is too low");
        require(msg.sender != address(0), "Sender is not null");
        require(artItem.currentOwner != address(0), "Owner is not null");
        // delete artItems[artId];
        removeItem(artId);
        IERC721(nftContract).safeTransferFrom(_owner, msg.sender, tokenId);
        payable(_owner).call{value: msg.value}('');
        emit NFTBought(nftContract, msg.sender, artId);
    }

    /** @notice List tokenId for a given contract
        @dev artId is unique per contract address and tokenId. Emits NFTBought
        @param nftContract ERC721 contract holding token
        @param tokenId identifier for token that is to be listed, belonging to `nftContract`
        @param price for token listed
        @param title of artwork (not used)
        @return The artId identifier for listing */
    function listItem(address nftContract, uint tokenId, uint price, string memory title) public returns (bytes32) {
        address _owner = IERC721(nftContract).ownerOf(tokenId);
        require(_owner == msg.sender, "Sender is not owner");
        bytes32 artId = hash1(nftContract, tokenId);
        ArtItem storage artItem = artItems[artId];
        require(artItem.forSale == false, "Item already listed");

        // artItems[artId] = ArtItem(artId, nftContract, owner, tokenId, title, price, true);
        addItem(artId, nftContract, _owner, tokenId, title, price);
        emit NFTListed(artItem.artId, artItem.nftContract, artItem.tokenId, msg.sender);
        return artItem.artId;
    }

    function addItem(bytes32 artId, address nftContract, address _owner, uint tokenId, string memory title, uint price) internal {
        artIdCounter.increment();
        if (artItems[artId].forSale == false) {
            artItems[artId] = ArtItem(artId, nftContract, _owner, tokenId, title, price, true);
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

    /** @notice Fetch items that have been listed for sale
        @return List of listed items */
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

    /** @notice Show contract owner
        @return Address of contract owner */
    function owner() public view returns (address) {
        return contractOwner;
    }

    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}

