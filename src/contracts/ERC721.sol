// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/draft-ERC721Votes.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DataToken is ERC721, ERC721Enumerable, ERC721Burnable, Ownable, EIP712, ERC721Votes {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("Ownership Token", "OWT") EIP712("Ownership Token", "1") {}

  address public ERC1155ContractAddr;
  address public Owner;

    function setERC1155ContractAddr(address _newERC1155ContractAddr) public onlyOwner  {
    ERC1155ContractAddr = _newERC1155ContractAddr;
  }

    function safeMint(address to) public{  
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();         /* ASC tokenID ß-... */
        _safeMint(to, newItemId);
        Owner = to;
    }

    function itemId() public view returns (uint256){
        uint256 number = _tokenIds.current();
        return number;
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _afterTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Votes)
    {
        super._afterTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}