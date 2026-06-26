import { ethers } from 'ethers';
import { LCAI_CHAIN_ID, LCAI_NETWORK, RECEIVING_WALLET, LISTING_FEE_WEI } from './constants';

export async function connectWallet() {
  if (!window.ethereum) throw new Error('MetaMask not found. Please install it.');

  await window.ethereum.request({ method: 'eth_requestAccounts' });
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const network = await provider.getNetwork();

  if (network.chainId !== LCAI_CHAIN_ID) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: LCAI_NETWORK.chainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [LCAI_NETWORK],
        });
      } else {
        throw switchError;
      }
    }
  }

  const signer = provider.getSigner();
  const address = await signer.getAddress();
  return { provider, signer, address };
}

export async function payListingFee(signer) {
  const tx = await signer.sendTransaction({
    to: RECEIVING_WALLET,
    value: ethers.BigNumber.from(LISTING_FEE_WEI),
  });
  await tx.wait();
  return tx.hash;
}

export function shortenAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
