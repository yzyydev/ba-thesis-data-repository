// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//imports for 1155 token contract from Openzeppelin
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/*
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░            Asset Factory            ░░░░░░░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
*/

contract AssetFactory is ERC1155, AccessControl, Ownable {
  using SafeMath for uint256;
  using Strings for string;

  string public name; // Token name
  string public symbol; // Token symbol
  string public contractURI; // Token symbol
  uint256 public circulation; // Total circulating supply
  uint256 public cost; // Per token cost
  bool public paused = false; // Switch critical funcs to be paused
  uint256 public ERC721TokenID;         //The NFT Ownership TokenID
  address public ERC721ContractAddr;    //The NFT ContractAddr.

  // Owner data storage
  struct Owners {
    address prev;
    address current;
    uint256 timestamp;
    uint256 total;
    address incentive;      //creator address
  }

  // Token owners
  mapping(uint256 => Owners) public owners;
  mapping (uint256 => string) private _tokenURIs;

  event newOwner(address current, uint256 tokenId);

  /*
   * @dev
   *      One-time call on contract initialisation.
   * @params
   *      _root - Address of deafult admin
   *      _name - Short name
   *      _symbol - Max 4 digit capitalised
   *      _cost - wei amount per tx e.g. 10413000000000000
   *      _uri - Link to token-level metadata
   *      _cURI - Link to contract-level metadata
   */
  constructor(
    address _root,
    string memory _name,
    string memory _symbol,
    string memory _uri,
    string memory _cURI,
    uint256 _cost
  ) ERC1155(_uri) {
    _setupRole(DEFAULT_ADMIN_ROLE, _root);

    name = _name;
    symbol = _symbol;
    cost = _cost;
    circulation = 0;
    contractURI = _cURI;
  }

  /*
   * @dev
   *      See {IERC165-supportsInterface}.
   */
  function supportsInterface(bytes4 interfaceId)
    public
    view
    virtual
    override(ERC1155, AccessControl)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }

  /*
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    * MODS 
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    */

  /*
   * @dev
   *      Restricted to members of the admin role.
   */
  modifier onlyAdmin() {
    require(isRole(DEFAULT_ADMIN_ROLE, msg.sender), "Restricted to admins.");
    _;
  }

  /*
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    * ROLES 
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    */

  /*
   * @dev
   *      Create a new role with the specified admin role.
   */
  function addAdmin(bytes32 roleId, bytes32 adminRoleId) external onlyAdmin {
    _setRoleAdmin(roleId, adminRoleId);
    //emit AdminRoleSet(roleId, adminRoleId);
  }

  /*
   * @dev
   *      Add role permissions to an account.
   */
  function addToRole(bytes32 roleId, address account) external onlyAdmin {
    grantRole(roleId, account);
  }

  /*
   * @dev
   *      Remove oneself from the admin role.
   */
  function renounceAdmin() external {
    renounceRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  /*
   * @dev
   *      Return `true` if the account belongs to the role specified.
   */
  function isRole(bytes32 roleId, address account) public view returns (bool) {
    return hasRole(roleId, account);
  }

  /*
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    * READ 
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    */

  /*
   * @dev
   *      Collection-level metadata.
   */
  function getContractURI() public view returns (string memory) {
    return contractURI; // Contract-level metadata
  }

  /*
     * @dev
     *      Get cost of buying token. 
            Pegged to static fiat conversion i.e.
            $100 per token at any time.
     */
  function getCost() external view returns (uint256) {
    return cost;
  }

  /*
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    * WRITE 
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    * ADMIN: onlyOwner funcs (contract owner address) 
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    */

  /*
   * @dev
   *      Batch mint tokens.
   * @params
   *      _to - Address tokens will be sent
   *      _tokenIds - Ids of tokens to be minted
   *      _amounts - Number of token under ids (1155 caters for fungible/non-fungible mix)
   */
  function batchMint(
    address _to,
    uint256[] memory _tokenIds,
    uint256[] memory _amounts
  ) external onlyAdmin {
    _mintBatch(_to, _tokenIds, _amounts, "");

    if (_tokenIds.length > 0) {
      for (uint256 i = 0; i < _tokenIds.length; i++) {
        uint256 tokenId = _tokenIds[i];
        owners[tokenId] = Owners(
          address(0), // prev
          address(this), // current
          block.timestamp, // timestamp
          0, // number of owners
          address(this)
        );
        circulation += _amounts[i]; // if amount is larger than 1 we need to make sure circulation is correctly incremented
      }
    }
  }

  function tokenMint(
      address _to,
      uint256 _tokenId,
      uint256 _amount,
      string memory _uriInput) public {        /* ASC tokenID ß-... */
        _mint(_to, _tokenId, _amount,"");
         owners[_tokenId] = Owners(
          address(0), // prev
          address(this), // current
          block.timestamp, // timestamp
          0, // number of owners
          address(this)
        );
        circulation += _amount;
        setURI(_uriInput, _tokenId);
      }
  
    function uri(uint256 tokenId) override public view 
    returns (string memory) { 
        return(_tokenURIs[tokenId]); 
    } 
    function _setTokenUri(uint256 tokenId, string memory tokenURI)
    public onlyAdmin {
         _tokenURIs[tokenId] = tokenURI; 
    } 

  /*
   * @dev
   *      Set URI for token metadata.
   * @params
   *      _uri - Updated link to JSON metadata per token
   */
  function setURI(string memory _uri, uint256 tokenId) public {
    _setURI(_uri);
    _tokenURIs[tokenId] = _uri; 
  }

  /*
   * @dev
   *      Set expiry time for buying a token.
   */

  /*
     * @dev
     *      Set cost of buying token. 
            Pegged to static fiat conversion i.e.
            $100 per token at any time.
     */
  function setCost(uint256 _newCost) external onlyAdmin {
    cost = _newCost;
  }

    /*
     * @dev
     *      Set cost of buying token. 
            Pegged to static fiat conversion i.e.
            $100 per token at any time.
     */
  function setERC721ContractAddress(address _newERC721ContractAddr) external onlyAdmin {
    ERC721ContractAddr = _newERC721ContractAddr;
  }

    /*
     * @dev
     *      Set cost of buying token. 
            Pegged to static fiat conversion i.e.
            $100 per token at any time.
     */
  function setERC721TokenID(uint256 _newERC721TokenID) external onlyAdmin {
    ERC721TokenID = _newERC721TokenID;
  }

  /*
   * @dev
   *      Set critical contract functions to be paused.
   */
  function setPaused(bool _paused) external onlyAdmin {
    paused = _paused;
  }

  /*
     * @dev
     *      Allow buyer to transfer token from owner wallet to theirs.
            Value transferred in tx is sent to owner address.
     * @params
     *      _tokenId - token to be transferred
     *      _buyer - Address fo buyer
     *      _amount - Number of tokens to be transferred (1 by default)
     *      _data - Aux byte data (not a requirment)
     */
  function buy(
    uint256 _tokenId,
    address _buyer,
    uint256 _amount,
    bytes memory _data
  ) external payable {
    require(!paused, "Contract is currently paused.");

    address owner = owner();
    uint256 available = balanceOf(owner, _tokenId);

    // Must be tokens remaining in owner balance.
    require(available >= _amount, "No tokens remaining.");

    if (isRole(DEFAULT_ADMIN_ROLE, _buyer) == true) {
      // Bypass payment if buyer is on excluded list.
      _safeTransferFrom(owner, _buyer, _tokenId, _amount, _data);
      return;
    }
    // Buyer address must not already own.
    require(
      owners[_tokenId].current != _buyer,
      "Address already owns this token."
    );
    // Amount paid must meet token value.
    require(msg.value == cost, "Value is not correct.");
    // Commence transfer.
    _safeTransferFrom(owner, _buyer, _tokenId, _amount, _data);
    // Transfer amount paid into previous token owner's address.
    payable(owner).transfer(msg.value);
  }

  /*
     * @dev 
     *      Hook that is called before any token transfer. This includes minting
            and burning, as well as batched variants.
     *      The same hook is called on both single and batched variants. For single
            transfers, the length of the `id` and `amount` arrays will be 1.
     */
  function _beforeTokenTransfer(
    address operator,
    address from,
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) internal virtual override {
    require(ids.length == amounts.length, "Mismatched params.");
    for (uint256 i = 0; i < ids.length; i++) {
      // Mark buyer address as owner.
      owners[ids[i]].prev = from;
      owners[ids[i]].current = to;
      owners[ids[i]].timestamp = block.timestamp;
      owners[ids[i]].total + 1;
      emit newOwner(to, ids[i]);
    }
    super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
  }

  // Fund withdrawal function.
  function withdraw() external payable onlyAdmin {
    // This will transfer the remaining contract balance to the owner address.
    (bool os, ) = payable(owner()).call{value: address(this).balance}("");
    require(os);
  }
}