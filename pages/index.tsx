import {
  ConnectEmbed,
  ThirdwebNftMedia,
  useAddress,
  useContract,
  useNFT,
  useOwnedNFTs,
  Web3Button,
} from "@thirdweb-dev/react";
import type { NextPage } from "next";
import { useState } from "react";
import { Zoom } from "react-awesome-reveal";
import ConfettiExplosion from "react-confetti-explosion";

import { abi as LandRedeemerAbi } from "../abis/LandRedeemer";

import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const address = useAddress();

  const [opening, setOpening] = useState(false);
  const [reward, setReward] = useState<{ tokenId: any } | null>(null);

  const { contract: packContract } = useContract("0xc57d3D3A27cEf85c307d05EE6f45c1e10356172e", "pack");
  const { contract: landContract } = useContract("0xf2bBea4303629499ab0e088CE718791b027de49f", "nft-collection");
  const { contract: landTicketContract } = useContract("0x7603d3f8617762a4c3CD0B4fa4eB2c25FaD860f6", "nft-collection");

  // @ts-ignore
  const { data: landTickets = [], isLoading: isLoadingTickets } = useOwnedNFTs(landTicketContract, address, { enabled: !opening });
  // @ts-ignore
  const { data: lands = [] } = useOwnedNFTs(landContract, address, { enabled: !opening });
  // @ts-ignore
  const { data: packs = [], isLoading: isLoadingPacks } = useOwnedNFTs(packContract, address, { enabled: !opening });
  const { data: rewardNft } = useNFT(landContract, reward?.tokenId);

  if (!address) {
    return (
      <div className={styles.container} style={{ marginTop: 0 }}>
        <ConnectEmbed />
      </div>
    );
  }

  const isLoading = isLoadingTickets || isLoadingPacks;
  const redeemableNfts = [...landTickets, ...packs];

  return (
    <div>
      <div className={styles.container} style={{ marginTop: 0 }}>
        <div className={styles.collectionContainer}>
          {!isLoading ? (
            redeemableNfts?.length ? (
              <div className={styles.nftBoxGrid}>
                {redeemableNfts?.map((nft, index) => (
                  <div className={styles.nftBox} key={nft.metadata.id.toString()}>
                    <ThirdwebNftMedia
                      // @ts-ignore
                      metadata={{
                        ...nft.metadata,
                        image: `${nft.metadata.image}`,
                      }}
                      className={styles.nftMedia}
                    />
                    <h3>{nft.metadata.name}</h3>

                    <Web3Button
                      contractAddress="0x0A7cFB6cC31E03a03F66C849016D447645bD4B38"
                      contractAbi={LandRedeemerAbi}
                      action={async (contract) => {
                        const contractAddress = contract.getAddress();
                        
                        const isApproved = await landTicketContract!.isApproved(address, contractAddress);
                        if (!isApproved) {
                          await landTicketContract!.setApprovalForAll(contractAddress, true);
                        }

                        if (index < landTickets.length) {
                          await contract.call("redeemTicket", [nft.metadata.id, 0]);
                        }

                        setOpening(true);
                        const opened = await packContract?.open(0, 1, 4200000);
                        setOpening(false);

                        const rewards = opened?.erc721Rewards ?? [];
                        if (rewards.length) {
                          setReward(rewards[0]);
                        }
                      }}
                    >
                      Open
                    </Web3Button>
                  </div>
                ))}
              </div>
            ) : (
              <p>You don't have Land Tickets...</p>
            )
          ) : (
            <p>Loading...</p>
          )}

          {reward?.tokenId == rewardNft?.metadata.id && rewardNft && (
            <div className={styles.absolute} onClick={() => setReward(null)}>
              <Zoom>
                <ConfettiExplosion
                  particleCount={300}
                />
                <ThirdwebNftMedia
                  // @ts-ignore
                  metadata={{
                    ...rewardNft.metadata,
                    image: `${rewardNft.metadata.image}`,
                  }}
                  className={styles.nftMedia}
                />
                <h3>Congrats! You got {rewardNft.metadata.name}!</h3>
              </Zoom>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Home;
