// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/** @title Artworks contract
    @author astroquant-dev
    @notice Contract holds artworks used in the NFT shop */
contract BlockchainArt is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    address contractOwner;
    Counters.Counter private _tokenIdCounter;
    string public uri;
    uint256 mintingPrice;

    event Minted(address sender, uint256 tokenId, address approval);

    constructor(
        address owner,
        string memory name,
        string memory symbol,
        uint256 price,
        string memory uri_
    ) ERC721(name, symbol) {
        uri = uri_;
        mintingPrice = price;
        contractOwner = owner;
        transferOwnership(owner);
        setApprovalForAll(contractOwner, true);
    }

    /** @notice Return base URI for contract's metadata
        @return Contract base URI */
    function _baseURI() internal view override returns (string memory) {
        return uri;
    }

    /** @notice Show number of tokens minted
        @return Number of tokens minted */
    function tokenCount() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /** @notice Function used to mint new token. 
        @dev tokenId counter is incremented, Minted event is emitted
        @return Number of tokens minted */
    function safeMint() public payable returns (uint256) {
        require(msg.value >= mintingPrice, "Value paid is too low");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(msg.sender, tokenId);
        setApprovalForAll(contractOwner, true);

        emit Minted(msg.sender, tokenId, contractOwner);
        return tokenId;
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    /** @notice Return URI for given token
        @param tokenId The token id
        @return URI corresponding to tokenId */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
