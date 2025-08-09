import React, { useState, useEffect, useMemo } from 'react';
import { WalletAddress, WalletTransaction } from '@types/wallet';
import './WalletOverview.css';

interface WalletOverviewProps {
  wallet: WalletAddress;
  transactions?: WalletTransaction[];
  onAddressClick?: (address: string) => void;
  onExportData?: (wallet: WalletAddress) => void;
  showAdvanced?: boolean;
}

interface WalletMetrics {
  avgTransactionSize: number;
  largestTransaction: number;
  mostActiveHour: number;
  uniqueTokensTraded: number;
  profitLoss: number;
  winRate: number;
}

const WalletOverview: React.FC<WalletOverviewProps> = ({ 
  wallet, 
  transactions = [], 
  onAddressClick, 
  onExportData,
  showAdvanced = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [metrics, setMetrics] = useState<WalletMetrics | null>(null);

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getRiskLevel = (score: number): string => {
    if (score > 0.8) return 'High Risk';
    if (score > 0.5) return 'Medium Risk';
    if (score > 0.2) return 'Low Risk';
    return 'Very Low Risk';
  };

  const getRiskColor = (score: number): string => {
    if (score > 0.8) return '#ff4757';
    if (score > 0.5) return '#ffa502';
    if (score > 0.2) return '#ffb143';
    return '#2ed573';
  };

  const calculateMetrics = useMemo((): WalletMetrics => {
    if (!transactions.length) {
      return {
        avgTransactionSize: 0,
        largestTransaction: 0,
        mostActiveHour: 0,
        uniqueTokensTraded: 0,
        profitLoss: 0,
        winRate: 0
      };
    }

    const amounts = transactions.map(tx => tx.amount || 0);
    const avgTransactionSize = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    const largestTransaction = Math.max(...amounts);
    
    const hours = transactions.map(tx => new Date(tx.blockTime * 1000).getHours());
    const hourCounts = hours.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const mostActiveHour = Object.entries(hourCounts)
      .reduce((max, [hour, count]) => count > max.count ? { hour: parseInt(hour), count } : max, { hour: 0, count: 0 })
      .hour;

    const uniqueTokens = new Set(transactions.map(tx => tx.mint || 'SOL')).size;
    
    return {
      avgTransactionSize,
      largestTransaction,
      mostActiveHour,
      uniqueTokensTraded: uniqueTokens,
      profitLoss: Math.random() * 1000 - 500, // Placeholder calculation
      winRate: Math.random() * 100 // Placeholder calculation
    };
  }, [transactions]);

  useEffect(() => {
    setMetrics(calculateMetrics);
  }, [calculateMetrics]);

  const handleAddressClick = () => {
    if (onAddressClick) {
      onAddressClick(wallet.address);
    } else {
      navigator.clipboard.writeText(wallet.address);
    }
  };

  const handleExport = () => {
    if (onExportData) {
      onExportData(wallet);
    }
  };

  return (
    <div className={`wallet-overview ${isExpanded ? 'expanded' : ''}`}>
      <div className="wallet-header">
        <div className="wallet-title">
          <h2>{wallet.label || 'Unnamed Wallet'}</h2>
          <span className="wallet-status">
            {wallet.isWhitelisted ? '✓ Whitelisted' : '⚠ Not Whitelisted'}
          </span>
        </div>
        <div className="wallet-actions">
          <button onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
          <button onClick={handleExport}>Export</button>
        </div>
      </div>

      <div className="wallet-basic-info">
        <div className="info-item" onClick={handleAddressClick}>
          <label>Address:</label>
          <span className="address-display" title={wallet.address}>
            {formatAddress(wallet.address)}
          </span>
        </div>
        
        <div className="info-grid">
          <div className="info-item">
            <label>Total Transactions:</label>
            <span>{wallet.totalTransactions.toLocaleString()}</span>
          </div>
          
          <div className="info-item">
            <label>Total Volume:</label>
            <span>{wallet.totalVolume.toFixed(4)} SOL</span>
          </div>
          
          <div className="info-item">
            <label>Risk Assessment:</label>
            <span 
              className="risk-indicator" 
              style={{ color: getRiskColor(wallet.riskScore) }}
            >
              {getRiskLevel(wallet.riskScore)} ({(wallet.riskScore * 100).toFixed(1)}%)
            </span>
          </div>
          
          <div className="info-item">
            <label>Last Activity:</label>
            <span>{wallet.lastActivity?.toLocaleDateString() || 'Unknown'}</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="wallet-detailed-info">
          <div className="timeframe-selector">
            <label>Timeframe:</label>
            <select 
              value={selectedTimeframe} 
              onChange={(e) => setSelectedTimeframe(e.target.value as '24h' | '7d' | '30d')}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          {metrics && (
            <div className="metrics-grid">
              <div className="metric-card">
                <h4>Average Transaction Size</h4>
                <span>{metrics.avgTransactionSize.toFixed(6)} SOL</span>
              </div>
              
              <div className="metric-card">
                <h4>Largest Transaction</h4>
                <span>{metrics.largestTransaction.toFixed(6)} SOL</span>
              </div>
              
              <div className="metric-card">
                <h4>Most Active Hour</h4>
                <span>{metrics.mostActiveHour.toString().padStart(2, '0')}:00</span>
              </div>
              
              <div className="metric-card">
                <h4>Unique Tokens</h4>
                <span>{metrics.uniqueTokensTraded}</span>
              </div>
              
              <div className="metric-card">
                <h4>Estimated P&L</h4>
                <span className={metrics.profitLoss >= 0 ? 'profit' : 'loss'}>
                  {metrics.profitLoss >= 0 ? '+' : ''}{metrics.profitLoss.toFixed(2)} USD
                </span>
              </div>
              
              <div className="metric-card">
                <h4>Win Rate</h4>
                <span>{metrics.winRate.toFixed(1)}%</span>
              </div>
            </div>
          )}

          {wallet.tags && wallet.tags.length > 0 && (
            <div className="wallet-tags">
              <label>Tags:</label>
              <div className="tag-list">
                {wallet.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {showAdvanced && (
            <div className="advanced-analytics">
              <h4>Advanced Analytics</h4>
              <div className="analytics-placeholder">
                <p>Transaction pattern analysis would be displayed here</p>
                <p>Token distribution charts</p>
                <p>Time-based activity graphs</p>
                <p>Risk factor breakdown</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletOverview;

