const Web3 = require("web3");
const { ethers } = require("ethers");
const axios = require('axios');

const keyConfig = require('./config/config.json');

const provider = new ethers.providers.WebSocketProvider(`wss://eth-rinkeby.alchemyapi.io/v2/${keyConfig.alchemy_key}`);
const web3 = new Web3(new Web3.providers.HttpProvider(`https://eth-rinkeby.alchemyapi.io/v2/${keyConfig.alchemy_key}`));

const depositor = web3.eth.accounts.wallet.add(keyConfig.eth_key).address;

const eventABI = [{
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "ReceivePayment",
    "type": "event"
}, {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "makeDeposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}];

const birdgeContract = new ethers.Contract(
    keyConfig.bridge_addr,
    eventABI,
    provider
);

birdgeContract.on('ReceivePayment', async(fromAddr, amount, txBody) => {
    // console.log(fromAddr, amount, txBody);
    // const txData = txBody.args._data;
    const txData = "0x22045fbe0000000000000000000000009492224b81acf442da114ea1313c0284a584f85800000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009ac2c46d7acc21c881154d57c0dc1c55a31391987a5b22ef931df109a87a7039030f473faaafc6497be819436eaff75a1f70118500000000000000000000000000000000000000000000000000000000000003649b151a8000000000000000000000000000000000000000000000000000000000000000200000000000000000000000009492224b81acf442da114ea1313c0284a584f858000000000000000000000000997f29174a766a1da04cf77d135d59dd12fb54d1000000000000000000000000d6b563dcee68dd6150a485e7bec073aefe1c2b3c000000000000000000000000362fa9d0bca5d19f743db50738345ce2b40ec99f000000000000000000000000e71678794fff8846bff855f716b0ce9d9a78e8440000000000000000000000009ac2c46d7acc21c881154d57c0dc1c55a3139198000000000000000000000000fd1b05e51653339c850c8a18c9ac11aed9105f2a000000000000000000000000236c6ffc7c72d1fe69ff3530d5abebc0b1594f990000000000000000000000000000000000000000000000000000000000000000c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470e5961f8eef154780ac761e5b314a052aa287e548fff870a596f2db19edba728e0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000554d3f1a7b3692ce00000000000000000000000000000000000000000000000000000000062f51b3c0000000000000000000000000000000000000000000000000000000000aa7c33000000000000000000000000000000000000000000000000176dabfc87aa57800000000000000000000000000000000000000000000000000000000000000280000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000003200000000000000000000000000000000000000000000000000000000000000041aabfbfc101005cfed360b34b530b8a00b461454ece9cf7605f3f32a82a64b5727be850960fb25e1896d6e9d787c33757d0e3bf5d750f591c310cca0536ddd1df1b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    const sender = ethers.utils.getAddress('0x' + txData.substr(874, 40));
    const receiver = ethers.utils.getAddress('0x' + txData.substr(938, 40));
    // const receiveAmount = (ethers.BigNumber.from('0x' + txData.substr(1298, 64))).toString();

    console.log(sender, receiver);

    const txInfo = await axios.post('http://localhost:4000/find_tx', {
        sender,
        receiver,
        from_chain: 3,
        to_chain: 4,
        // receive_amount: receiveAmount
    });

    if(txInfo.data && txInfo.data.status) {
        if(txInfo.data.data) {
            const requestData = new ethers.utils.Interface(eventABI).encodeFunctionData("makeDeposit", [
                amount,
                sender
            ]);

            await web3.eth
            .sendTransaction({
                from: depositor,
                to: keyConfig.bridge_addr,
                data: requestData,
                gas: 1000000
            })
            .on("transactionHash", function (hash) {
                console.log(hash, "hash");
            })
            .on("receipt", async function (receipt) {
                if (receipt.status) {
                    await axios.post('http://localhost:4000/update_tx', {
                        id: txInfo.data.data.id
                    })
                }
            })
            .on("error", function (error, receipt) {
                console.log(error, receipt);
            });
        }
    }
});
