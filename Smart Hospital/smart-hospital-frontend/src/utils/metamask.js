import { ethers } from "ethers";

const GANACHE_CHAIN_ID = "0x7a69"; // ⭐ 5777
const GANACHE_PARAMS = {
  chainId: GANACHE_CHAIN_ID,
  chainName: "Ganache Local",
  rpcUrls: ["http://127.0.0.1:7545"],
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
};

// ✅ Auto switch network
export const switchToGanache = async () => {

  if (!window.ethereum) {
    alert("Install MetaMask!");
    return;
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: GANACHE_CHAIN_ID }],
    });

  } catch (error) {

    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [GANACHE_PARAMS],
      });
    }
  }
};

// ✅ Connect wallet safely
export const connectWallet = async () => {

  if (!window.ethereum) {
    alert("Install MetaMask!");
    return null;
  }

  await switchToGanache();

  const provider = new ethers.BrowserProvider(window.ethereum);

  await provider.send("eth_requestAccounts", []);

  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  // ⭐ Listen for wallet change (VERY IMPORTANT)
  window.ethereum.on("accountsChanged", () => {
    window.location.reload();
  });

  return { signer, address };
};

// ✅ Sign bind message
export const signBindMessage = async (signer) => {

  const message = "Bind this wallet to my medical account";

  return await signer.signMessage(message);
};
