'use client';
import { LiFiWidget, WidgetConfig } from '@lifi/widget';
import { useConnectModal } from '@rainbow-me/rainbowkit';

export default function LifiWidget() {
  const { openConnectModal } = useConnectModal();

  const config = {
    toChain: 56,
    toToken: '0x0F1cBEd8EFa0E012AdbCCB1638D0aB0147D5Ac00',
    variant: 'wide',
    appearance: 'dark',
    theme: {
      colorSchemes: {
        light: {
          palette: {
            primary: {
              main: '#9bcb0a',
            },
            secondary: {
              main: '#F5B5FF',
            },
          },
        },
        dark: {
          palette: {
            primary: {
              main: '#c2fe0c',
            },
            secondary: {
              main: '#F5B5FF',
            },
          },
        },
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
      },
      container: {
        borderRadius: '16px',
      },
    },
    walletConfig: {
      onConnect: () => {
        if (openConnectModal) openConnectModal();
      },
    },
  } as Partial<WidgetConfig>;

  return <LiFiWidget integrator="Hello Dex" config={config} />;
}
