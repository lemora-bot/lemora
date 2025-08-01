import React from 'react';
import { WalletAddress } from '@types/wallet';
import './WalletOverview.css';

interface WalletOverviewProps {
  wallet: WalletAddress;
}

const WalletOverview: React.FC<WalletOverviewProps> = ({ wallet }) => {
  return (
    <div className="wallet-overview">
      <h2>{wallet.label || 'Unnamed Wallet'}</h2>
      <p>Address: {wallet.address}</p>
      <p>Total Transactions: {wallet.totalTransactions}</p>
      <p>Total Volume: {wallet.totalVolume.toFixed(2)} SOL</p>
      <p>Risk Score: {wallet.riskScore}</p>
      {/* Add more detailed wallet information here */}
    </div>
  );
};

export default WalletOverview;

