# MetaSoccer Lands

MetaSoccer Lands are unique NFTs representing each of the 210 FIFA countries. These lands offer exclusive ownership and significant opportunities within the MetaSoccer ecosystem.

## Smart Contract

The [MetaSoccer Lands smart contract](https://polygonscan.com/address/0x5b40f62fe5dd53ec89d82d432c05b9ed79764c5a#code) implements [Thirdweb's NFT contract](https://portal.thirdweb.com/contracts/explore/pre-built-contracts/nft-collection). The metadata is hosted on IPFS and is immutable, except for the image, which is hosted on MetaSoccer's servers.

## Land Tickets

MetaSoccer Land Tickets are ERC-721 tokens that allow users to mint MetaSoccer Lands. Initially, these tickets were minted and sold on [Telefónica's marketplace](https://colecciones.tu.com/en/collections/metasoccer-lands).

To ensure fair distribution of the lands, we use [Thirdweb's Pack Smart Contract](https://portal.thirdweb.com/contracts/design-docs/pack) to create openable loot boxes containing MetaSoccer Lands NFTs (Land Packs). Each Land Pack contains one MetaSoccer Land NFT.

Each Land Ticket grants the user the right to redeem one Land Pack via the [LandTicketRedeemer.sol smart contract](onchain/contracts/LandTicketRedeemer.sol). This smart contract receives the MetaSoccer Land Ticket NFT, burns it, and transfers one MetaSoccer Land Pack NFT to the user. The webapp streamlines this process by opening the Land Pack NFT once it is received.
