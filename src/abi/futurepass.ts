export const FUTUREPASS_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'delegate',
        type: 'address',
      },
    ],
    name: 'delegateType',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
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
        internalType: 'uint8',
        name: 'callType',
        type: 'uint8',
      },
      {
        internalType: 'address',
        name: 'callTo',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'callData',
        type: 'bytes',
      },
    ],
    name: 'proxyCall',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'delegate',
        type: 'address',
      },
      {
        internalType: 'uint8',
        name: 'proxyType',
        type: 'uint8',
      },
    ],
    name: 'registerDelegate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'delegate',
        type: 'address',
      },
    ],
    name: 'unregisterDelegate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
