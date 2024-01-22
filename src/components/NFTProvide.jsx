import React, { useState } from "react";
import { useMoralis, useMoralisQuery, useWeb3ExecuteFunction} from "react-moralis";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { Card, Input, Steps } from "antd";
import Text from "antd/lib/typography/Text";
import {  SolutionOutlined, LoadingOutlined, SmileOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';
import { message, Upload, Modal } from 'antd';
import { Select } from 'antd';
import { Button } from 'antd';
import { InputNumber } from 'antd';
import { Headline } from 'react-native-paper';
import { FileUpload } from "react-ipfs-uploader";

let erc1155dataurl = "";
const { Option, OptGroup } = Select;
const ethtext = "ETH";
let erc721tokenID ="";

const { Dragger } = Upload;
const props = {
  name: 'file',
  multiple: true,
  action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',

  onChange(info) {
    const { status } = info.file;

    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }

    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  },

  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files);
  },
};




const { Step } = Steps;
const styles = {
  table: {
    margin: "0 auto",
    width: "1000px",
  },
};
const { TextArea } = Input;
const onChange = (e) => {
    console.log('Change:', e.target.value);
  };
  
  

function NFTProvide() {
  const { chainId, marketAddress, contractABI, walletAddress } =
    useMoralisDapp();
  const { Moralis } = useMoralis();
  const queryItemImages = useMoralisQuery("ItemImages");
  const [fileUrl, setFileUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [datatype, setDatatype] = useState("");
  const [price, setPrice] = useState("");
  const [fileimage, setFileImage] = useState("");
  const contractProcessor = useWeb3ExecuteFunction();
  const contractABIJson = JSON.parse(contractABI);
  const fetchItemImages = JSON.parse(
    JSON.stringify(queryItemImages.data, [
      "nftContract",
      "tokenId",
      "name",
      "image",
    ])
  );


  const handleChangePrice = (value) => {
    console.log(`selected ${value}`);
    setPrice(value);
  };

  const hash = fileUrl.replace("https://ipfs.infura.io/ipfs/", ""); /* IPFS HASH FILE */ 


  const onSubmit = async(e) =>{
      const filehash="";

      //First upload file from Upload area to IPFS
      const metadata = {
        title,
        description,
        datatype,
        price,
        filehash,
        fileimage
      };
      metadata.filehash = fileUrl.replace("https://ipfs.infura.io/ipfs/", "");
      //const file = new Moralis.File("C0A" + {hash} + ".json", j);
      console.log(JSON.stringify(metadata));
      console.log('hash:', hash);
      const file = new Moralis.File(metadata.title + "_provide.json", {
        base64: Buffer.from(JSON.stringify(metadata)).toString("base64"),
      }
      );
      await file.saveIPFS();
      const metadataurl = file.ipfs().replace("https://ipfs.moralis.io:2053/ipfs/","");
      console.log('metadataurl:', metadataurl);
      erc1155dataurl = metadataurl;
      succSubmit();


    
    //Create JSON file from the IPFS hash and upload with meta data to the IPFS
  }

  function succSubmit() {
    let secondsToGo = 5;
    const modal = Modal.success({
      title: "Success!",
      content: `Your DataSet is uploaded to IPFS. Please process with the other steps.`,
    });
    setTimeout(() => {
      modal.destroy();
    }, secondsToGo * 1000);
  }

  const handleChangeType = (value) => {
    console.log(`selected ${value}`);
    setDatatype(value);
    if (value == "type1" || value=="type2" ){
      setFileImage("https://ipfs.infura.io/ipfs/QmRDBX9rmbcEAi8m5i7Wk3XtmPnUzTVmbycGWNPKbX35BN");
    }
    else{
      setFileImage("https://ipfs.infura.io/ipfs/QmUgkz5sCZt39JMW5PWu28mTfwwTyd9WLScg978RMeENLG");
    }
  };

  async function onMintERC721() {
    const nullvalue = 0;
    const ops = {
      contractAddress: "0x683A3867B230C060E23A7C2597Cd51B4e26FCa0C",
      functionName: "safeMint",
      abi: [{ "inputs": [ { "internalType": "address", "name": "to", "type": "address" } ], "name": "safeMint", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "function" }],
      params: {
        to: walletAddress
      },
      msgValue: nullvalue,
    };
    

    await contractProcessor.fetch({
      params: ops,
      onSuccess: () => {
        console.log("minted erc721");
        succERC721();
      },
      onError: (error) => {
        console.log("f minted erc721");
        failERC721();
      },
    });
  }

  function succERC721() {
    let secondsToGo = 5;
    const modal = Modal.success({
      title: "Success!",
      content: `Your Data Set Owner Token is minted. Please process with the other steps.`,
    });
    setTimeout(() => {
      modal.destroy();
    }, secondsToGo * 1000);
  }

  function failERC721() {
    let secondsToGo = 5;
    const modal = Modal.success({
      title: "Fail!",
      content: `Your Data Set Owner Token could not be minted. Please try again.`,
    });
    setTimeout(() => {
      modal.destroy();
    }, secondsToGo * 1000);
  }
  async function onMintERC1155() {
    erc721tokenID = await getERC721ItemID();
    console.log(erc721tokenID);
    const uri = "https://ipfs.moralis.io:2053/ipfs/" + erc1155dataurl;
    const nullvalue = 0;
    const ops = {
      contractAddress: "0xaf4D5917F0a61583F0FC18E6a3ff0E1765E4529b",
      functionName: "tokenMint",
      abi: [{ "inputs": [ { "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "uint256", "name": "_tokenId", "type": "uint256" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "string", "name": "_uriInput", "type": "string" } ], "name": "tokenMint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }],
      params: {
        _to: walletAddress,
        _tokenId: erc721tokenID,
        _amount: 20,
        _uriInput: uri
      },
      msgValue: nullvalue,
    };
    console.log(uri);

    await contractProcessor.fetch({
      params: ops,
      onSuccess: () => {
        console.log("minted erc1155");
        succERC1155();
      },
      onError: (error) => {
        console.log("f so hard minted erc1155");
        failERC1155()
      },
    });
  }
  function succERC1155() {
    let secondsToGo = 5;
    const modal = Modal.success({
      title: "Success!",
      content: `The Data Token for Selling is minted. Please process with the other steps.`,
    });
    setTimeout(() => {
      modal.destroy();
    }, secondsToGo * 1000);
  }

  function failERC1155() {
    let secondsToGo = 5;
    const modal = Modal.success({
      title: "Fail!",
      content: `The Data Token for Selling could not be minted. Please try again.`,
    });
    setTimeout(() => {
      modal.destroy();
    }, secondsToGo * 1000);
  }
  async function sellDataToken() {
    const p = price * ("1e" + 18);
    const pamount = 20;
    const ops = {
      contractAddress: "0xCAe41DCEFe24D54C3E747524C26fb5b6E993F563",
      functionName: "createMarketItem",
      abi: contractABIJson,
      params: {
        nftContract: "0xaf4D5917F0a61583F0FC18E6a3ff0E1765E4529b",
        tokenId: erc721tokenID,
        price: String(p),
        amount: pamount,
        data: [],
      },
    };
    console.log(ops.contractAddress);
    console.log(marketAddress);
    await contractProcessor.fetch({
      params: ops,
      onSuccess: () => {
        console.log("success");
        succList();
      },
      onError: (error) => {
        failList();
      },
    });
  }
  async function approveAll(nft) { 
    const ops = {
      contractAddress: "0xaf4D5917F0a61583F0FC18E6a3ff0E1765E4529b",
      functionName: "setApprovalForAll",
      abi: [{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"}],
      params: {
        operator: "0xCAe41DCEFe24D54C3E747524C26fb5b6E993F563",
        approved: true
      },
    };
    console.log(ops.contractAddress);
    console.log(nft.token_address);
    await contractProcessor.fetch({
      params: ops,
      onSuccess: () => {
        console.log(ops.contractAddress);
        console.log(nft.token_address);
        console.log("Approval Received");
        succApprove();
      },
      onError: (error) => {
        failApprove();
      },
    });
  }
  function succList() {
    let secondsToGo = 5;
    const modal = Modal.success({
      title: "Success!",
      content: `Your NFT was listed on the marketplace`,
    });
    setTimeout(() => {
      modal.destroy();
    }, secondsToGo * 1000);
  }

  function succApprove() {
    let secondsToGo = 5;
    const modal = Modal.success({
      title: "Success!",
      content: `Approval is now set, you may list your NFT`,
    });
    setTimeout(() => {
      modal.destroy();
    }, secondsToGo * 1000);
  }

  function failList() {
    let secondsToGo = 5;
    const modal = Modal.error({
      title: "Error!",
      content: `There was a problem listing your NFT`,
    });
    setTimeout(() => {
      modal.destroy();
    }, secondsToGo * 1000);
  }

  function failApprove() {
    let secondsToGo = 5;
    const modal = Modal.error({
      title: "Error!",
      content: `There was a problem with setting approval`,
    });
    setTimeout(() => {
      modal.destroy();
    }, secondsToGo * 1000);
  }
  async function getERC721ItemID(){
    const ops = {
      contractAddress: "0x683A3867B230C060E23A7C2597Cd51B4e26FCa0C",
      functionName: "itemId",
      abi: [{ "inputs": [], "name": "itemId", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }],
    };
    const message = await Moralis.executeFunction(ops);
    console.log(message);
    await contractProcessor.fetch({
      params: ops,
      onSuccess: () => {
        console.log("success itemID");
      },
      onError: (error) => {
        console.log("failed gertItemID minted erc1155");
      },
    });
    return message;
  }
  

  return (
    <>
      <div>
      <Headline align = "center">Provide and Sell DataSets</Headline>
      <br />
      <br />
          <Card>
        <>
        <Text>
            DataSet Title
        </Text>
          <Input showCount maxLength={50} onChange={(e) => setTitle(e.target.value)}/>
             <br />
              <br />
            <Text>
            DataSet Description
        </Text>
            <TextArea showCount maxLength={100} onChange={(e) => setDescription(e.target.value)} />
            <br />
            <Text>
            Select Data Type
        </Text>
        <br />
            <Select
    defaultValue=""
    style={{
      width: 200,
    }}
    onChange={handleChangeType}
  >
    <OptGroup label="Unprocessed DataSet">
      <Option value="type1">Type 1</Option>
      <Option value="type2">Type 2</Option>
    </OptGroup>
    <OptGroup label="Processed DataSet">
      <Option value="type3">Type 3</Option>
      <Option value="type4">Type 4</Option>
    </OptGroup>
  </Select>
  </>
  <br />
  <br />
  <p>
      DataSet Price
  </p>
    <InputNumber addonAfter={ethtext} controls={false}  onChange={handleChangePrice}/><p>ETH</p>
  <br />
  <div>
      <FileUpload setUrl={setFileUrl} />
    </div>
         <br />
         <Button type="primary" shape="round" align="center" size={"large"} onClick={onSubmit}>
             Provide DataSet
        </Button>
        <Button type="primary" shape="round" align="center" size={"large"} onClick={onMintERC721}>
             Mint Ownership
        </Button>
        <Button type="primary" shape="round" align="center" size={"large"} onClick={onMintERC1155}>
             Mint Datatoken
        </Button>
        <Button type="primary" shape="round" align="center" size={"large"} onClick={approveAll}>
             Approve
        </Button>
        <Button type="primary" shape="round" align="center" size={"large"} onClick={sellDataToken}>
             Sell DataToken
        </Button>
         <br />
         <br />
        <Steps>
            <Step status="process" title="Provide" icon={<LoadingOutlined />} />
            <Step status="wait" title="Mint 1/2" icon={<SolutionOutlined />} />
            <Step status="wait" title="Mint 2/2" icon={<SolutionOutlined />} />
            <Step status="wait" title="Success" icon={<SmileOutlined />} />
        </Steps>
        </Card>
      </div>
    </>
  );
}

export default NFTProvide;