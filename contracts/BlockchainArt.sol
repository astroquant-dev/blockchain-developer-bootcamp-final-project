// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BlockchainArt is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    address contractOwner;
    Counters.Counter private _tokenIdCounter;
    string public uri;
    uint artPrice;

    event Minted(address sender, uint tokenId, address approval);


    constructor(address owner, string memory name, string memory symbol, uint price, string memory uri_) ERC721(name, symbol) {
        uri = uri_;
        contractOwner = owner;
        transferOwnership(owner);
        setApprovalForAll(contractOwner, true);

        // require(owner == this.owner());
    }

    function _baseURI() internal view override returns (string memory) {
        return uri;
    }

    function tokenCount() public view returns (uint) {
        return _tokenIdCounter.current();
    }

    function safeMint() payable public returns (uint) {
        require(msg.value >= artPrice);

        uint tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(msg.sender, tokenId);
        setApprovalForAll(contractOwner, true);

        emit Minted(msg.sender, tokenId, contractOwner);
        return tokenId;
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
