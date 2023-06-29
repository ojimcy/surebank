require('dotenv').config();
const ethers = require('ethers');
const { bscNode, maticNode } = require('./config');

const walletPks = [];

const bscProvider = new ethers.providers.WebSocketProvider(bscNode);

const polygonProvider = new ethers.providers.WebSocketProvider(maticNode);

const tronProvider = new ethers.providers.WebSocketProvider(maticNode);

const BlockchainNetworks = {
  BSC: 'Smart chain',
  POLYGON: 'Polygon',
  TRON: 'Tron',
};

/**
 *
 * @param {string} network
 * @returns {ethers.providers.Web3Provider}
 */
const getWsProvider = (network) => {
  switch (network) {
    case BlockchainNetworks.BSC:
      return bscProvider;
    case BlockchainNetworks.POLYGON:
      return polygonProvider;
    case BlockchainNetworks.TRON:
      return tronProvider;
    default:
      return false;
  }
};

module.exports = { getWsProvider, walletPks, BlockchainNetworks };
