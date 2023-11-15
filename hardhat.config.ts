import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const TESTNET_PRIVATE_KEY = "";

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    lukso_testnet: {
      url: "https://rpc.testnet.lukso.network",
      accounts: [TESTNET_PRIVATE_KEY],
    },
  },
};

export default config;
