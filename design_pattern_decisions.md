# Design patterns

## Access control

Access control has been implemented in two different ways:

- In BlockchainArt.sol, the contract implements the abstract contract Ownable, which allows the contract creator to transfer ownership of the contract to an address different from msg.sender upon creation. In practice, both the Shop and the BlockchainArt are created by msg.sender, but ownership of the BlockchainArt will be immediately transferred to the Shop in our project.

- In Shop.sol, the modifier onlyOwner is defined.

## Inheritance and interfaces

- BlockchainArt inherits from the ERC721 contract (to ensure compatibility with the ERC721 standard), ERC721URIStorage abstract contract, OpenZeppelin's Ownable abstract contract (to implement access control) and OpenZeppelin's ReentrancyGuard abstract contract (as a security measure, SWC-107).
- Shop inherits OpenZeppelin's IERC721Receiver interface to ensure that a receiver contract supports safe transfers of ERC721 assets, as well as OpenZeppelin's ReentrancyGuard abstract contract (SWC-107).

