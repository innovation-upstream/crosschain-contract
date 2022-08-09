require("@nomicfoundation/hardhat-toolbox");
require('@nomiclabs/hardhat-etherscan');

const keyConfig = require('./config/config.json');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  defaultNetwork: 'rinkeby',
  networks: {
    rinkeby: {
      chainId: 4,
      url: `https://eth-rinkeby.alchemyapi.io/v2/${keyConfig.alchemy_key}`,
      accounts: [keyConfig.eth_key]
    }
  },
  etherscan: {
    apiKey: keyConfig.api_key
  },
};
