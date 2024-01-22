# `Repositories for Data Monetization An Eco-system for Distributed Management of Data and Monitoring of Use`


In the present era of digital communication, more and more data is collected through the numerous connected devices in our everyday of life, which leads to a surplus of data. These data are just stored mostly in central data storage and it is difficult to search for the relevant information. The most successful companies are already analyzing data from their industry sector. A structured data repository as a SaaS creates franchises and companies with shared data pools, a platform to integrate, exchange and analyze data sets. In this thesis, a decentralized repository for data management and monitoring data is implemented on an Ethereum testnet. This eco-system is built with ReactJS and Moralis on top of the Ethereum-boilerplate. On the platform, users should be able to buy, access, sell, and provide data sets with their connected crypto wallet. Access control to purchased data sets through the ERC-1155 token is here introduced and implemented. Further, different ERC tokens and smart contracts are proposed and implemented. The usage of the data sets can be logged on the blockchain, which interacts as a digital ledger technology. An incentive system should motivate data users and data providers to work with this platform. In the evaluation chapter, the transaction costs related to gas usage, gas price and Ethereum price are calculated and elaborated in favor to improve the system and analyze the performance. Additionally, the user experience and the user-friendliness toward the platform are discussed and concluded in the last chapter.

# 🚀 Quick Start

📄 Clone or fork `ba-thesis-data-repository`:
```sh
git clone https://github.com/yzyydev/ba-thesis-data-repository.git
```
💿 Install all dependencies:
```sh
cd data-repository-master
yarn install 
```
✏ Rename `.env.example` to `.env` in the main folder and provide your `appId` and `serverUrl` from Moralis ([How to start Moralis Server](https://docs.moralis.io/moralis-server/getting-started/create-a-moralis-server)) 
Example:
```jsx
REACT_APP_MORALIS_APPLICATION_ID = xxxxxxxxxxxx
REACT_APP_MORALIS_SERVER_URL = https://xxxxxx.grandmoralis.com:2053/server
```

🔎 Locate the MoralisDappProvider in `src/providers/MoralisDappProvider/MoralisDappProvider.js` and paste the deployed marketplace smart contract address and ABI
```jsx
const [contractABI, setContractABI] = useState();
const [marketAddress, setMarketAddress] = useState();
```

🔃 Sync the `MarketItemCreated` event `/src/contracts/marketplaceBoilerplate.sol` contract with your Moralis Server, making the tableName `MarketItems`
```jsx
event MarketItemCreated (
  uint indexed itemId,
  address indexed nftContract,
  uint256 indexed tokenId,
  address seller,
  address owner,
  uint256 price,
  bool sold
);
```


🚴‍♂️ Run your App:
```sh
yarn start
```


