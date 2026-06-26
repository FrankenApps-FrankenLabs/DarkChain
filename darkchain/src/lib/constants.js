export const LCAI_CHAIN_ID = 9200;
export const LCAI_CHAIN_ID_HEX = '0x23F0';
export const RECEIVING_WALLET = '0x7FE522ab4F456cFc41FE7a7a0C94F28801CCA8fc';
export const LISTING_FEE_LCAI = 100;
export const LISTING_FEE_WEI = '100000000000000000000'; // 100 LCAI in wei

export const LCAI_NETWORK = {
  chainId: LCAI_CHAIN_ID_HEX,
  chainName: 'LightChain AI',
  nativeCurrency: { name: 'LCAI', symbol: 'LCAI', decimals: 18 },
  rpcUrls: ['https://rpc.lightchain.ai'],
  blockExplorerUrls: ['https://explorer.lightchain.ai'],
};

export const CATEGORIES = [
  'DeFi',
  'Gaming',
  'NFT',
  'AI',
  'Utility',
  'Social',
  'Casino',
  'Music',
  'Other',
];

export const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'darkchain_admin';
