import {
  ConnectEmbed,
  ConnectWallet,
  NFT,
  ThirdwebNftMedia,
  useAddress,
  useContract,
  useNFT,
  useOwnedNFTs,
  Web3Button,
} from "@thirdweb-dev/react";
import type { NextPage } from "next";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Zoom } from "react-awesome-reveal";
import ConfettiExplosion from "react-confetti-explosion";

import { abi as LandRedeemerAbi } from "../abis/LandRedeemer";

import styles from "../styles/Home.module.css";

const REDEEMER_CONTRACT_ADDRESS = "0xfb12278D4C3BB9651e45Be37dC8156a1DB9AbE45";

const Home: NextPage = () => {
  const address = useAddress();

  const [isOpening, setIsOpening] = useState(false);
  const [redeemableNfts, setRedeemableNfts] = useState<NFT[]>([]);
  const [reward, setReward] = useState<{ tokenId: any } | null>(null);

  const { contract: packContract } = useContract("0xA6AafDD9e8B77FEbb96bf60E853a905770a7EbD3", "pack");
  const { contract: landContract } = useContract("0x5b40f62fe5dd53ec89d82d432c05b9ed79764c5a", "nft-collection");
  const { contract: landTicketContract } = useContract("0x1C80e3D799eBf28E47C488EcdABd7ea47B5d8595", "nft-collection");

  const { data: landTickets = [], isLoading: isLoadingTickets } = useOwnedNFTs(landTicketContract, address);
  const { data: lands = [] } = useOwnedNFTs(landContract, address);
  const { data: packs = [], isLoading: isLoadingPacks } = useOwnedNFTs(packContract, address);
  const { data: rewardNft } = useNFT(landContract, reward?.tokenId);

  const isLoading = isLoadingTickets || isLoadingPacks;

  useEffect(() => {
    if (reward?.tokenId == rewardNft?.metadata.id && rewardNft) {
      setIsOpening(false);
    }
  }, [reward, rewardNft]);

  useEffect(() => {
    if (!isOpening) {
      setRedeemableNfts([...landTickets, ...packs]);
    }
  }, [isOpening, landTickets, packs])

  if (!address) {
    return (
      <div className={styles.container} style={{ marginTop: 0 }}>
        <div className={styles.collectionContainer}>
          <ConnectEmbed
            showThirdwebBranding={false}  
          />

          <div className={styles.footer}>
            Made with &lt;3 for MetaSoccer&apos;s community
          </div>

          <div className={styles.header}>
            <Image alt="MetaSoccer" src="https://assets.metasoccer.com/metasoccer-logo.svg" height={24} width={120} className={styles.logo} />
          </div>
        </div>
      </div>
    );
  }

  return (
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
                    contractAddress={REDEEMER_CONTRACT_ADDRESS}
                    contractAbi={LandRedeemerAbi}
                    action={async (contract) => {
                      try {
                        const contractAddress = contract.getAddress();
                        
                        const isApproved = await landTicketContract!.isApproved(address, contractAddress);
                        if (!isApproved) {
                          await landTicketContract!.setApprovalForAll(contractAddress, true);
                        }

                        setIsOpening(true);

                        if (index < landTickets.length) {
                          await contract.call("redeemTicket", [nft.metadata.id, 0]);
                        }

                        const opened = await packContract?.open(0, 1, 4200000);

                        const rewards = opened?.erc721Rewards ?? [];
                        if (rewards.length) {
                          setReward(rewards[0]);
                        }
                      } catch (err) {
                        setIsOpening(false);
                      }
                    }}
                  >
                    Open
                  </Web3Button>
                </div>
              ))}
              {lands?.map((nft, index) => (
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
                </div>
              ))}
            </div>
          ) : (
            <p>You don&apos;t have Lands nor Land Tickets...</p>
          )
        ) : (
          <p>Loading...</p>
        )}

        <div className={styles.footer}>
          Made with &lt;3 for MetaSoccer&apos;s community
        </div>

        <div className={styles.header}>
          <Image alt="MetaSoccer" src="https://assets.metasoccer.com/metasoccer-logo.svg" height={24} width={120} className={styles.logo} />
          <ConnectWallet />
        </div>
      </div>

      {reward?.tokenId == rewardNft?.metadata.id && rewardNft && (
        <div className={styles.absolute} onClick={() => setReward(null)}>
          <Zoom>
            <ConfettiExplosion
              particleCount={300}
            />
            <ThirdwebNftMedia
              metadata={{
                ...rewardNft.metadata,
                image: `${rewardNft.metadata.image}`,
              }}
              className={styles.nftMedia}
            />
            {/* @ts-ignore */}
            <h3>Congrats! You got {rewardNft.metadata.attributes.find((attr) => attr.trait_type === "Name")?.value}!</h3>
          </Zoom>
        </div>
      )}
    </div>
  );
};

export default Home;
