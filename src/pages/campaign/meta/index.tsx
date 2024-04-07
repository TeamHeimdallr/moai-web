import { Helmet as ReactHelmet } from 'react-helmet';

export const Helmet = () => {
  return (
    <ReactHelmet>
      <title>Moai Finance - Voyage to the Future</title>

      <meta name="title" content="Moai Finance - Voyage to the Future" />
      <meta name="description" content="Activate your $XRP" />
      <link rel="canonical" href="https://app.moai-finance.xyz/campaign" />

      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://app.moai-finance.xyz/campaign" />
      <meta property="og:title" content="Moai Finance - Voyage to the Future" />
      <meta property="og:description" content="Activate your $XRP" />
      <meta
        property="og:image"
        content="https://assets.moai-finance.xyz/images/og-image-campaign-voyage.png"
      />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:site" content="Moai Finance - Voyage to the Future" />
      <meta property="twitter:title" content="Moai Finance - Voyage to the Future" />
      <meta property="twitter:url" content="https://app.moai-finance.xyz/campaign" />
      <meta property="twitter:description" content="Activate your $XRP" />
      <meta
        property="twitter:image"
        content="https://assets.moai-finance.xyz/images/og-image-campaign-voyage.png"
      />
    </ReactHelmet>
  );
};
