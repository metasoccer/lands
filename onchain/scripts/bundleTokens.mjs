import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import dotenv from "dotenv";
dotenv.config();
import { BigNumber } from "ethers";
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
  const packAddress = "0xA6AafDD9e8B77FEbb96bf60E853a905770a7EbD3";
  const nftAddress = "0x5b40f62fE5Dd53Ec89D82D432c05B9eD79764C5A";

  const sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY, "polygon", {
    clientId: process.env.THIRDWEB_API_CLIENT_ID,
    secretKey: process.env.THIRDWEB_API_SECRET_KEY,
  });

  const address = await sdk.deployer.getSigner().getAddress();

  const pack = await sdk.getContract(packAddress, 'pack');
  const edition = await sdk.getContract(nftAddress, 'edition');

  await edition.setApprovalForAll(packAddress, true);
  console.log("Set Approval for edition");

  const jsonFolderPath = path.join(__dirname, "../data/metadata"); // Change this to the path of your JSON files folder
  const mintedTokensPath = path.join(__dirname, "mintedTokens.json");

  let mintedTokens = {};

  // Load minted tokens from the file if it exists
  if (fs.existsSync(mintedTokensPath)) {
    mintedTokens = JSON.parse(fs.readFileSync(mintedTokensPath, "utf-8"));
  }

  let erc721Rewards = [];

  fs.readdir(jsonFolderPath, async (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    for (const file of files) {
      const filePath = path.join(jsonFolderPath, file);

      if (path.extname(filePath) === ".json") {
        const jsonFile = fs.readFileSync(filePath);

        // const uri = await sdk.storage.upload(jsonFile);
        // console.log(`Uploaded ${file} to IPFS with URI: ${uri}`);

        let tokenIdToUse;

        if (mintedTokens[file]) {
          console.log(`Skipping minting ${file} as it has already been minted.`);
          tokenIdToUse = BigNumber.from(mintedTokens[file].hex);
        } else {
          // // Get the next token ID to mint
          // const nextTokenIdToMint = await edition.call("nextTokenIdToMint");
          // console.log(`Next token ID to mint: ${nextTokenIdToMint}`);

          // // Mint NFT to the address
          // const tx = await edition.call("mintTo", [address, uri]);
          // console.log(`Minted NFT to ${address} with transaction: ${tx}`);

          // // Save the minted token ID to avoid minting it again
          // tokenIdToUse = nextTokenIdToMint;
          // mintedTokens[file] = tokenIdToUse;
          // fs.writeFileSync(mintedTokensPath, JSON.stringify(mintedTokens, null, 2), "utf-8");
        }

        // Add minted token to erc721Rewards array
        erc721Rewards.push({
          contractAddress: nftAddress,
          tokenId: tokenIdToUse,
          quantityPerReward: 1,
          totalRewards: 1,
        });
      }
    }

    console.log("Creating packs now...");

    // Split erc721Rewards into chunks of up to 10
    const chunkSize = 10;
    for (let i = 0; i < erc721Rewards.length; i += chunkSize) {
      if (i === 0) {
        const chunk = erc721Rewards.slice(i, i + chunkSize);
        await pack.create({
          packMetadata: {
            name: "MetaSoccer Lands",
            description: "MetaSoccer Lands are unique NFTs, each representing one of the 210 FIFA countries. These lands offer exclusive ownership and significant opportunities within the MetaSoccer ecosystem.",
            image: "https://ipfs.io/ipfs/QmUQbm9YtkiHApFVdYUCMbQ37WmgTHr556mdrqQtNy79M2",
          },
          erc721Rewards: chunk,
          rewardsPerPack: 1,
        });
      } else {
        const chunk = erc721Rewards.slice(i, i + chunkSize);
        const packNfts = await pack.addPackContents(0, { erc721Rewards: chunk.filter((i) => parseInt(i.tokenId) !== 6) });
        console.log(`Added chunk of ${chunk.length} ERC721 rewards to the pack.`);
        console.log(packNfts);
      }
    }

    console.log(`====== Success: Pack NFTs =====`);
  });
})();