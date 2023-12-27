export const CAMPAIGN_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'rootTokenAddr_',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'xrpTokenAddr_',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'vaultAddress_',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'nativeXrpRootLpTokenAddress_',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'bptAddr_',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'poolId_',
        type: 'bytes32',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'prevApr',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newApr',
        type: 'uint256',
      },
    ],
    name: 'AprChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'claimer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountRoot',
        type: 'uint256',
      },
    ],
    name: 'Claim',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountBPT',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'exitAssetIndex',
        type: 'uint256',
      },
    ],
    name: 'ExitPool',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountFarmedBPTIn',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountFarmedBPT',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'depositedTime',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'totalRewardToBePaid',
        type: 'uint256',
      },
    ],
    name: 'Farmed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountXrp',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountRoot',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountBPT',
        type: 'uint256',
      },
    ],
    name: 'JoinPool',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'participant',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountXrpIn',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountRootIn',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountXrpForJoin',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountPairedRootForJoin',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'remainedRootLiquidtySupport',
        type: 'uint256',
      },
    ],
    name: 'Participate',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'prevPeriodToLockupLPSupport',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newPeriodToLockupLPSupport',
        type: 'uint256',
      },
    ],
    name: 'PeriodToLockupLPSupportChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountBPTIn',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'rewardPool',
        type: 'uint256',
      },
    ],
    name: 'ProvideRewards',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'prevRewardAdmin',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newRewardAdmin',
        type: 'address',
      },
    ],
    name: 'RewardAdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'prevRewardStartTime',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'prevRewardEndTime',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newRewardStartTime',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newRewardEndTime',
        type: 'uint256',
      },
    ],
    name: 'RewardTimeChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'prevAdmin',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newAdmin',
        type: 'address',
      },
    ],
    name: 'RootLiquidityAdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountRoot',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'liquiditySupport',
        type: 'uint256',
      },
    ],
    name: 'SupportLiquidity',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountRootIn',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountXrpOut',
        type: 'uint256',
      },
    ],
    name: 'SwapRootToXrp',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountRoot',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'liquiditySupport',
        type: 'uint256',
      },
    ],
    name: 'TakebackLiquidity',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountFarmedBPTOut',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountFarmedBPT',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountPairedBPTLocked',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'totalRewardToBePaid',
        type: 'uint256',
      },
    ],
    name: 'UnFarmed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'prevUserLockupPeriod',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newUserLockupPeriod',
        type: 'uint256',
      },
    ],
    name: 'UserLockupPeriodChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountBPT',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountToBeFreed',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'additionalLockedLiquidity',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'lockedLiquidity',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'liquiditySupport',
        type: 'uint256',
      },
    ],
    name: 'Withdraw',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountBPT',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'lockedLiquidity',
        type: 'uint256',
      },
    ],
    name: 'WithdrawLiquidityAsBPTAfterLockup',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountBPTOut',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'rewardPool',
        type: 'uint256',
      },
    ],
    name: 'WithdrawRewards',
    type: 'event',
  },
  {
    inputs: [],
    name: 'apr',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'newApr',
        type: 'uint256',
      },
    ],
    name: 'changeApr',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'newPeriodToLockupLPSupport',
        type: 'uint256',
      },
    ],
    name: 'changePeriodToLockupLPSupport',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newAdmin',
        type: 'address',
      },
    ],
    name: 'changeRewardAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'newStartTime',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'newEndTime',
        type: 'uint256',
      },
    ],
    name: 'changeRewardTime',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newAdmin',
        type: 'address',
      },
    ],
    name: 'changeRootLiquidityAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'newLockupPeriod',
        type: 'uint256',
      },
    ],
    name: 'changeUserLockupPeriod',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'farms',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountFarmed',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountPairedBPTLocked',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'unclaimedRewards',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'lastRewardTime',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'depositedTime',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'liquiditySupport',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'liquiditySupportLockupPeriod',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lockedLiquidity',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'moaiPoolId',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'moaiVaultAddr',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nativeXrpRootLpTokenAddress',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountXrpIn',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountRootIn',
        type: 'uint256',
      },
    ],
    name: 'participate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'periodToLockupLPSupport',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'provideRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewardAdmin',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewardEndTime',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewardPool',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewardStartTime',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewardToBePaid',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewardTokenAddr',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rootIndex',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rootLiquidityAdmin',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rootTokenAddr',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'simulateAccrue',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'amountFarmed',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'amountPairedBPTLocked',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'unclaimedRewards',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'lastRewardTime',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'depositedTime',
            type: 'uint256',
          },
        ],
        internalType: 'struct RewardFarm.Farm',
        name: 'farmSimulated',
        type: 'tuple',
      },
      {
        internalType: 'uint256',
        name: 'rewardToBePaidSimulated',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'rewardPoolSimulated',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'additionalLockedLiquiditySimulated',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'spotPriceLimit',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'supportLiquidity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'takebackSupport',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'userLockupPeriod',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'withdrawRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'withdrawSupportAfterCampaign',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'xrpIndex',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'xrpRootBptAddr',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'xrpTokenAddr',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
