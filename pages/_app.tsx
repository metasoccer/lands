import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import type { AppProps } from "next/app";
import "../styles/globals.css";

// This is the chainId your dApp will work on.
const activeChainId = ChainId.Polygon;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider activeChain={activeChainId} clientId="92fc269e1a4386a026bc24727a115e12">
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
