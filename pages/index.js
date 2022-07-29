import { useState } from 'react';
import Head from 'next/head';
import axios from 'axios';
import Web3Modal from 'web3modal';
import { ethers, providers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import LIFI from '@lifi/sdk'

let web3Modal;
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    cacheProvider: false, // optional
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: '570f1ebd62024227a90b259a6e718de0',
        },
      }
    },
  });
}

const lifi = new LIFI({
  apiUrl: 'https://staging.li.quest/v1/' // endpoint for test api
  // apiUrl: 'https://li.quest/v1/'
});

export default function Home() {
  const [amount, setAmount] = useState("");
  const [chainID, setChainID] = useState(null);
  const [userAddr, setUserAddr] = useState(null);
  const [userSigner, setUserSigner] = useState(null);
  
  const connectWallet = async () => {
    try {
      const provider = await web3Modal.connect();
      const web3Provider = new providers.Web3Provider(provider);
      
      const conSigner = web3Provider.getSigner(0);
      const conAddr = await conSigner.getAddress();
      const network = await web3Provider.getNetwork();
      
      setUserAddr(conAddr);
      setUserSigner(conSigner);
      setChainID(network.chainId);
    } catch(err) {
      console.log(err);
      alert(err.message);
    }
  }

  const switchChainHook = async(requiredChainId) => {
    console.log('here');

    // this is where MetaMask lives
    const ethereum = window.ethereum;
    
    // check if MetaMask is available
    if (typeof ethereum === 'undefined') return
    
    // use the MetaMask RPC API to automatically switch chains
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: requiredChainId }],
    })
    
    // build a new provider for the new chain
    const newProvider = new ethers.providers.Web3Provider(window.ethereum)

    const conSigner = newProvider.getSigner(0);
    const conAddr = await conSigner.getAddress();
    const network = await newProvider.getNetwork();
    
    setUserAddr(conAddr);
    setUserSigner(conSigner);
    setChainID(network.chainId);
  }

  const updateCallback = (updatedRoute) => {
    let lastExecution;
    for (const step of updatedRoute.steps) {
      if (step.execution) {
        lastExecution = step.execution;
      }
    }
    console.log(lastExecution);
  }

  const doSwap = async() => {
    const newChain = 97;
    if(userSigner && chainID && amount && parseFloat(amount) > 0) {
      const routesRequest = {
        // fromAddress: userAddr,
        fromChainId: 4, // Ropsten
        fromAmount: ethers.utils.parseEther(amount.toString()).toString(), // ETH amount
        // fromTokenAddress: '0xe71678794fff8846bff855f716b0ce9d9a78e844', // Test Token
        fromTokenAddress: '0x9ac2c46d7acc21c881154d57c0dc1c55a3139198',
        // fromTokenAddress: '0x0000000000000000000000000000000000000000',
        toChainId: 3, // Rinkeby
        toTokenAddress: '0xe71678794fff8846bff855f716b0ce9d9a78e844'
        // toTokenAddress: '0xd86bcb7d85163fbc81756bb9cc22225d6abccadb', // BNB Test Token
        // toTokenAddress: '0x9ac2c46d7acc21c881154d57c0dc1c55a3139198' // Test Token
        // toTokenAddress: '0x0000000000000000000000000000000000000000'
      };
      const routesResponse = await lifi.getRoutes(routesRequest);

      console.log(routesResponse);

      if(routesResponse.routes.length > 0) {
        try {
          const routeResult = await lifi.executeRoute(
            userSigner, 
            routesResponse.routes[0],
            {
              // switchChainHook: switchChainHook('0x' + newChain.toString(16)),
              // switchChainHook,
              updateCallback,
            }
          );

          console.log(routeResult);
        } catch(err) {
          console.log(err, 'tx errr');
        }
      } else {
        alert('No route found');
      }
    } else {
      alert('Invalid request');
    }
  }

  return (
    <div className="container">
      <Head>
        <title>CrossChain Swap testing</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          Welcome to <a href="#">CrossChain Swap testing</a>
        </h1>

        {
          userAddr ? 
          <>
            <div className="grid wallet-addr">
              <h3>Your Wallet Address: {userAddr.substr(0, 6)}...{userAddr.substr(userAddr.length - 4)} </h3>
            </div>
            <div className='grid'>
              <input type="number" onChange={e => setAmount(e.target.value)} value={amount} className='input-style' placeholder='Input your amount' />
              <button onClick={e => doSwap()} className='click-btn'>Confirm</button>
            </div>
          </> :
          <div className="grid">
            <button onClick={e => connectWallet()} className="click-btn">Connect Wallet</button>
          </div>
        }
      </main>

      <footer>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' Team '}
          <img src="/vercel.svg" alt="Vercel" className="logo" />
        </a>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .input-style {
          height: 40px;
          font-size: 16px;
          border-radius: 8px;
          margin-bottom: 10px;
          padding: 0 10px;
        }

        .click-btn {
          width: 200px;
          height: 50px;
          text-align: center;
          align-items: center;
          padding: 0 0.5rem;
          color: white;
          margin-top: 10px;
          cursor: pointer;
          font-size: 20px;
          background-color: #042d5b;
          border-radius: 10px;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title {
          text-align: center;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 800px;
          margin-top: 2rem;
        }

        .wallet-addr {
          width: 50%;
          border-bottom: 2px solid;
          margin-bottom: 20px;
        }

        .logo {
          height: 1em;
        }

        .nft-img {
          height: 100px;
        }

        .nft-item {
          margin: 0 15px;
          padding: 10px 15px;
        }

        .nft-item span {
          margin-bottom: 5px;
          display: block;
        }

        .nft-item:hover,
        .nft-item:focus,
        .nft-item:active {
          background-color: #0070f3;
          color: white;
          border-radius: 10px;
          cursor: pointer;
        }

        .tx-div {
          width: 100%;
        }

        table, th, td {
          border: 1px solid;
          border-collapse: collapse;
          font-size: 16px;
          padding: 10px;
        }

        th {
          text-align: left;
        }

        .tx-table {
          width: 100%;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
