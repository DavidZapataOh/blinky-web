"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useConnect, useDisconnect, useWriteContract, useSimulateContract, useReadContract, useReadContracts, useSendTransaction } from 'wagmi'
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { formatEther, parseEther, erc20Abi, maxUint256 } from 'viem';
import { Chart as ChartJS } from 'chart.js/auto';
import { Doughnut, Line } from 'react-chartjs-2';
import abi from '@/abi/stakeABI.json';


const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS
const contractABI = abi

const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS
const tokenConfig = {
  address: TOKEN_ADDRESS,
  abi: erc20Abi,
}

const gameData = {
  "defi-kingdoms": {
    name: "Defi Kingdoms",
    image: "/defi-kingdoms.png",
    description:
        "Immerse yourself in the DeFi universe and experience automated staking that maximizes your on-chain rewards. Live the web3 revolution with intelligent strategies.",
    },
};

const StatsCard = ({ title, value, icon, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-primary/50 p-6 rounded-xl shadow-xl backdrop-blur-sm border border-text/10"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-text/10 rounded-lg">{icon}</div>
      {trend && (
        <span className={`text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <h3 className="text-sm text-text/60 mb-1">{title}</h3>
    <p className="text-2xl font-bold text-text">{value}</p>
  </motion.div>
);

const PoolCard = ({ pool, selected, onSelect }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
      selected 
        ? 'bg-secondary border-2 border-text/20' 
        : 'bg-primary/30 border-2 border-transparent hover:border-text/10'
    }`}
    onClick={onSelect}
  >
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-bold text-text">{pool.name}</h3>
      <span className={`text-xs px-3 py-1 rounded-full ${
        pool.stakePeriod === 0 ? 'bg-green-500/20 text-green-400' :
        pool.stakePeriod <= 30 ? 'bg-yellow-500/20 text-yellow-400' :
        'bg-red-500/20 text-red-400'
      }`}>
        {pool.stakePeriod === 0 ? 'Flexible' : `${pool.stakePeriod}d Lock`}
      </span>
    </div>
    
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-text/60">APR</span>
        <span className="font-medium text-green-400">{pool.rewardRate/100}%</span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-text/60">Deposit Fee</span>
        <span className="font-medium text-text">{pool.depositFees/100}%</span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-text/60">Withdrawal Fee</span>
        <span className="font-medium text-text">{pool.withdrawalFees/100}%</span>
      </div>
    </div>
  </motion.div>
);

const StrategyCard = ({ strategy, selected, onSelect }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
      selected 
        ? 'bg-gradient-to-br from-purple-600 to-blue-600 border-2 border-white/20' 
        : 'bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-2 border-transparent hover:border-white/10'
    }`}
    onClick={onSelect}
  >
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-bold">{strategy.name}</h3>
      <div className="flex space-x-2">
        {strategy.tags.map((tag, index) => (
          <span key={index} className="text-xs px-2 py-1 bg-white/10 rounded-full">
            {tag}
          </span>
        ))}
      </div>
    </div>
    <div className="space-y-4">
      <div className="flex justify-between">
        <span className="text-white/60">Expected APY</span>
        <span className="font-bold text-green-400">{strategy.apy}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-white/60">Risk Level</span>
        <span className={`font-bold ${strategy.riskColor}`}>{strategy.risk}</span>
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Strategy Allocation</h4>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          {strategy.allocation.map((alloc, index) => (
            <div
              key={index}
              style={{ width: `${alloc.percentage}%` }}
              className={`h-full ${alloc.color}`}
            />
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

const TabButton = ({ children, active, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`px-6 py-3 rounded-lg font-medium transition-all ${
      active 
        ? 'bg-thirty text-white' 
        : 'bg-primary text-text/60 hover:text-text'
    }`}
    onClick={onClick}
  >
    {children}
  </motion.button>
);

const performanceData = {
  labels: ['1D', '7D', '14D', '30D', '90D'],
  datasets: [
    {
      label: 'Portfolio Value',
      data: [1000, 1120, 1350, 1590, 2100],
      borderColor: 'rgb(147, 51, 234)',
      backgroundColor: 'rgba(147, 51, 234, 0.1)',
      fill: true,
      tension: 0.4
    },
    {
      label: 'AI Performance',
      data: [1000, 1180, 1450, 1780, 2400],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }
  ]
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.6)'
      }
    },
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.6)'
      }
    }
  },
  plugins: {
    legend: {
      labels: {
        color: 'rgba(255, 255, 255, 0.8)'
      }
    }
  }
};

const Dashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [selectedPool, setSelectedPool] = useState(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiMode, setAiMode] = useState('auto');
  const [stakingData, setStakingData] = useState({
    totalStaked: '0',
    availableRewards: '0',
    projectedAPY: '0',
    nextRewardTime: null,
    stakingHistory: [],
    aiPerformance: '0'
  });
  const [isLoading, setIsLoading] = useState(false);

  const { user } = usePrivy();
  const { address } = useAccount();
  const walletAddress = user?.wallet?.address || address;

  const { data: tokenBalance } = useReadContract({
    ...tokenConfig,
    functionName: 'balanceOf',
    args: [walletAddress],
    enabled: Boolean(walletAddress),
  });

  const { data: tokenAllowance } = useReadContract({
    ...tokenConfig,
    functionName: 'allowance',
    args: [walletAddress, CONTRACT_ADDRESS],
    enabled: Boolean(walletAddress),
  });

  const { 
    writeContractAsync,
    isPending: isWritePending,
    isSuccess: isApproved,
    data: txData
  } = useWriteContract();

  const { data: poolLength } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'getPoolLength',
  });

  const poolCalls = useMemo(() => {
    if (!poolLength) return [];
    
    return Array.from({ length: Number(poolLength) }, (_, i) => ({
      address: CONTRACT_ADDRESS,
      abi: contractABI,
      functionName: 'getPoolData',
      args: [BigInt(i)]
    }));
  }, [poolLength]);

  const { data: poolDataResults } = useReadContracts({
    contracts: poolCalls
  });

  const pools = useMemo(() => {
    if (!poolDataResults) return [];
    
    return poolDataResults
      .map((result, i) => {
        const poolData = result.result;
        if (!poolData || !poolData.isActive) return null;

        return {
          id: i,
          name: poolData.stakePeriod === BigInt(0) ? 'Flexible Staking' : `${Number(poolData.stakePeriod)}-Day Lock`,
          stakePeriod: Number(poolData.stakePeriod),
          depositFees: Number(poolData.depositFees) / 100,
          withdrawalFees: Number(poolData.withdrawlFees) / 100,
          rewardRate: Number(poolData.rewardRate) / 100,
          totalStakedIn: formatEther(poolData.totalStakedIn),
          isActive: poolData.isActive
        };
      })
      .filter(Boolean);
  }, [poolDataResults]);

  const poolOptions = useMemo(() => {
    return pools.map((pool) => ({
      value: pool.id,
      label: `${pool.name} - APR: ${pool.rewardRate}%`
    }));
  }, [pools]);

  const { data: poolData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'getPoolData',
    args: [BigInt(selectedPool)]
  });

  const { data: userStakesData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'userStakesData',
    args: [walletAddress, BigInt(selectedPool)]
  });

  const { data: userUnlockData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'userUnlockAmount',
    args: [walletAddress, BigInt(selectedPool)]
  });

  const { data: stakingTransactions } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'userTotalTxPerPool',
    args: [walletAddress, BigInt(selectedPool)]
  });

  const { data: pendingRewards } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'rewardCalculation',
    args: [
      userStakesData?.stakeAmount || BigInt(0),
      BigInt(selectedPool),
      BigInt(Math.floor((Date.now() / 1000) - (userStakesData?.lastClaimTime || 0)))
    ]
  });

  const { data: tokenSymbol } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'symbol',
  });

  const statsCards = [
    {
      title: "Your Total Staked",
      value: userStakesData?.stakeAmount ? 
        `${formatEther(userStakesData.stakeAmount)} ${tokenSymbol || 'BLINK'}` : 
        `0 ${tokenSymbol || 'BLINK'}`,
      icon: "💎"
    },
    {
      title: "Current APR",
      value: poolData?.rewardRate ? 
        `${(Number(poolData.rewardRate) / 100).toFixed(2)}%` : 
        "0%",
      icon: "📈"
    },
    {
      title: "Pending Rewards",
      value: pendingRewards ? 
        `${formatEther(pendingRewards)} ${tokenSymbol || 'BLINK'}` : 
        `0 ${tokenSymbol || 'BLINK'}`,
      icon: "🏆"
    }
  ];

  const canStake = useMemo(() => {
    const amountInWei = amount ? parseEther(amount) : BigInt(0);
    
    const conditions = {
      hasWallet: Boolean(walletAddress),
      hasAmount: Boolean(amount),
      hasSelectedPool: selectedPool !== undefined,
      hasPoolsAvailable: pools.length > 0,
      validPoolSelected: selectedPool >= 0,
      hasTokenBalance: Boolean(tokenBalance),
      hasSufficientBalance: tokenBalance ? amountInWei <= tokenBalance : false,
      hasAllowance: Boolean(tokenAllowance),
      hasSufficientAllowance: tokenAllowance ? amountInWei <= tokenAllowance : false,
      notLoading: !isLoading,
      notApproving: !isWritePending
    };

    console.log('Stake Conditions:', conditions);
    console.log('Current Values:', {
      amount: amount,
      amountInWei: amountInWei.toString(),
      balance: tokenBalance ? formatEther(tokenBalance) : '0',
      allowance: tokenAllowance ? formatEther(tokenAllowance) : '0',
      selectedPool,
      poolsLength: pools.length
    });

    const canStake = Boolean(
      walletAddress && 
      amount && 
      selectedPool !== undefined && 
      pools.length > 0 && 
      selectedPool >= 0 && 
      tokenBalance && 
      amountInWei <= tokenBalance &&
      tokenAllowance && 
      amountInWei <= tokenAllowance &&
      !isLoading &&
      !isWritePending
    );

    console.log('Can Stake:', canStake);

    return canStake;
  }, [walletAddress, amount, selectedPool, pools, tokenBalance, tokenAllowance, isLoading, isWritePending]);

  const handleDeposit = async () => {
    if (!amount || selectedPool === undefined || !walletAddress) return;
    
    try {
      setIsLoading(true);
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'deposit',
        args: [walletAddress, parseEther(amount), BigInt(selectedPool)],
        value: BigInt(0)
      });
      
      console.log('Transacción de stake enviada:', hash);
    } catch (error) {
      console.error('Error al hacer stake:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || !walletAddress) return;
    try {
      setIsLoading(true);
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'withdraw',
        args: [walletAddress, parseEther(amount), BigInt(selectedPool)],
        value: BigInt(0)
      });
      
      console.log('Transacción de retiro enviada:', hash);
    } catch (error) {
      console.error('Error al retirar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompound = async () => {
    if (!walletAddress) return;
    try {
      setIsLoading(true);
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'compound',
        args: [walletAddress, BigInt(selectedPool)],
        value: BigInt(0)
      });
      
      console.log('Transacción de compound enviada:', hash);
    } catch (error) {
      console.error('Error al hacer compound:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!walletAddress) return;
    try {
      setIsLoading(true);
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'claim',
        args: [walletAddress, BigInt(selectedPool)],
        value: BigInt(0)
      });
      
      console.log('Transacción de claim enviada:', hash);
    } catch (error) {
      console.error('Error al reclamar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canClaim = useMemo(() => {
    if (!userStakesData || !poolData) return false;
    return poolData.stakePeriod === BigInt(0) && 
           userStakesData.stakeAmount > BigInt(0) &&
           Date.now() / 1000 > Number(userStakesData.fullWithdrawlTime);
  }, [userStakesData, poolData]);

  const canWithdraw = useMemo(() => {
    if (!userUnlockData) return false;
    return userUnlockData.unlockAmount > BigInt(0);
  }, [userUnlockData]);

  const formattedBalance = useMemo(() => {
    if (!tokenBalance) return '0';
    return formatEther(tokenBalance);
  }, [tokenBalance]);

  const handleApprove = async () => {
    console.log('Iniciando aprobación...');
    
    try {
      setIsLoading(true);
      const hash = await writeContractAsync({
        abi: erc20Abi,
        address: TOKEN_ADDRESS,
        functionName: 'approve',
        args: [CONTRACT_ADDRESS, maxUint256],
      });
      
      console.log('Transacción enviada:', hash);
    } catch (error) {
      console.error('Error al aprobar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">GameFi Staking Agent</h1>
          <p className="text-lg opacity-80">Automated DeFi Kingdoms yield optimization</p>
        </header>

        <div className="relative w-full h-64 mb-12 rounded-2xl overflow-hidden">
          <Image
            src={gameData["defi-kingdoms"].image}
            alt={gameData["defi-kingdoms"].name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent">
            <div className="absolute bottom-0 left-0 p-8">
              <h2 className="text-3xl font-bold text-text mb-2">
                {gameData["defi-kingdoms"].name}
              </h2>
              <p className="text-text/80 max-w-2xl">
                {gameData["defi-kingdoms"].description}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h3 className="text-2xl font-bold text-text mb-6">How to Start Staking</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-secondary/30 p-6 rounded-xl border border-text/10">
              <div className="flex items-center mb-4">
                <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-text font-bold">1</span>
                <h4 className="ml-3 text-lg font-semibold text-text">Select Pool</h4>
              </div>
              <p className="text-text/70">Choose between Flexible or Locked staking based on your preferred lock period and APR.</p>
            </div>
            
            <div className="bg-secondary/30 p-6 rounded-xl border border-text/10">
              <div className="flex items-center mb-4">
                <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-text font-bold">2</span>
                <h4 className="ml-3 text-lg font-semibold text-text">Enter Amount</h4>
              </div>
              <p className="text-text/70">Input the amount of tokens you want to stake in the selected pool.</p>
            </div>
            
            <div className="bg-secondary/30 p-6 rounded-xl border border-text/10">
              <div className="flex items-center mb-4">
                <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-text font-bold">3</span>
                <h4 className="ml-3 text-lg font-semibold text-text">Start Earning</h4>
              </div>
              <p className="text-text/70">Approve the transaction and start earning rewards automatically.</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-text mb-4">Your Staking Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statsCards.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={<span>{stat.icon}</span>}
              />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-text mb-4">Available Staking Pools</h3>
          <p className="text-text/70 mb-6">Select a pool that matches your investment strategy. Higher lock periods offer better APR.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pools.map(pool => (
              <PoolCard 
                key={pool.id}
                pool={pool}
                selected={selectedPool === pool.id}
                onSelect={() => setSelectedPool(pool.id)}
              />
            ))}
          </div>
        </div>

        <div className="bg-primary/50 rounded-xl p-6 backdrop-blur-sm border border-text/10">
          <h3 className="text-xl font-semibold text-text mb-4">Staking Actions</h3>
          <div className="mb-6">
            <label className="block text-text/70 mb-2">Amount to Stake</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full bg-secondary/20 border border-text/10 rounded-lg p-3 text-text"
            />
            <div className="mt-4 text-sm text-text/60">
              Available: {formattedBalance} {tokenSymbol || 'BLINK'}
            </div>
          </div>

          <div className="space-y-4">
            {amount && (!tokenAllowance || parseEther(amount) > tokenAllowance) ? (
              <button
                onClick={handleApprove}
                disabled={isWritePending}
                className="w-full py-4 bg-secondary hover:bg-thirty rounded-lg text-text"
              >
                {isWritePending ? 'Check wallet...' : 'Approve'}
              </button>
            ) : (
              <button
                onClick={handleDeposit}
                disabled={!canStake}
                className={`w-full py-4 rounded-lg text-text ${
                  canStake 
                    ? 'bg-secondary hover:bg-thirty' 
                    : 'bg-secondary/50 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Processing...' : 
                 !walletAddress ? 'Connect Wallet' :
                 !amount ? 'Enter Amount' :
                 selectedPool === undefined ? 'Select Pool' :
                 'Stake Tokens'}
              </button>
            )}

            {isWritePending && <div className="text-sm text-text/60">Check your wallet...</div>}
            {isApproved && (
              <div className="text-sm text-green-500">
                Approval successful! Transaction: {txData?.hash}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleCompound}
                disabled={isLoading || !userStakesData?.stakeAmount}
                className="w-full bg-thirty hover:bg-secondary disabled:opacity-50 py-3 rounded-lg text-text"
              >
                {isLoading ? 'Processing...' : 'Compound Rewards'}
              </button>
              
              <button
                onClick={handleClaim}
                disabled={isLoading || !canClaim}
                className="w-full border border-text/20 hover:bg-text/5 disabled:opacity-50 py-3 rounded-lg text-text"
              >
                {isLoading ? 'Processing...' : 'Claim Rewards'}
              </button>
            </div>
            
            <button
              onClick={handleWithdraw}
              disabled={isLoading || !canWithdraw}
              className="w-full bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 py-3 rounded-lg text-red-400"
            >
              {isLoading ? 'Processing...' : 'Withdraw'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;