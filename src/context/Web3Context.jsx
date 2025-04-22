import { createContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const Web3Context = createContext();

const CONTRACT_ADDRESS = "0xaC5E16fB7367BB4D7bC8Cb830b740Cb7d2b47F90";
const CONTRACT_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "choice",
                "type": "bool"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "outcome",
                "type": "bool"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "payout",
                "type": "uint256"
            }
        ],
        "name": "Flipped",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "bool",
                "name": "userChoice",
                "type": "bool"
            }
        ],
        "name": "flip",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "flipHistory",
        "outputs": [
            {
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "choice",
                "type": "bool"
            },
            {
                "internalType": "bool",
                "name": "outcome",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "payout",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getFlipHistoryCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "houseEdge",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "maxBet",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "minBet",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
];

// Monad Testnet configuration
const MONAD_TESTNET = {
    chainId: '0x279f',
    chainName: 'Monad Testnet',
    nativeCurrency: {
        name: 'Monad',
        symbol: 'MON',
        decimals: 18
    },
    rpcUrls: ['https://testnet-rpc.monad.xyz'],
    blockExplorerUrls: ['https://testnet-explorer.monad.xyz']
};

export const Web3Provider = ({ children }) => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [account, setAccount] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [contract, setContract] = useState(null);


    const isMetaMaskInstalled = useCallback(() => {
        return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
    }, []);

    const disconnectWallet = useCallback(() => {
        setProvider(null);
        setSigner(null);
        setAccount(null);
        setIsConnected(false);
    }, []);

    const connectWallet = useCallback(async () => {
        try {
            setError(null);

            if (!isMetaMaskInstalled()) {
                throw new Error('MetaMask not detected');
            }

            // Request accounts access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            }).catch(err => {
                if (err.code === 4001) {
                    throw new Error('Please connect your MetaMask account to continue');
                }
                throw err;
            });

            // Check network
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId !== MONAD_TESTNET.chainId) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: MONAD_TESTNET.chainId }],
                    });
                } catch (switchError) {
                    if (switchError.code === 4902) {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [MONAD_TESTNET],
                        });
                    } else {
                        throw switchError;
                    }
                }
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer || provider);
            setContract(contractInstance);

            setProvider(provider);
            setSigner(signer);
            setAccount(accounts[0]);
            setIsConnected(true);

        } catch (err) {
            console.error("Connection error:", err);
            setError(err.message);
            setIsConnected(false);
        }
    }, [isMetaMaskInstalled]);

    // Initialize when component mounts
    useEffect(() => {
        const init = async () => {
            if (isMetaMaskInstalled()) {
                try {
                    // Check if already connected
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        const provider = new ethers.BrowserProvider(window.ethereum);
                        const signer = await provider.getSigner();

                        setProvider(provider);
                        setSigner(signer);
                        setAccount(accounts[0]);
                        setIsConnected(true);
                    }
                } catch (err) {
                    console.error("Initialization error:", err);
                }
            }
        };

        init();

        return () => { };
    }, [isMetaMaskInstalled]);

    // Set up event listeners
    useEffect(() => {
        if (!isMetaMaskInstalled()) return;

        const handleAccountsChanged = (accounts) => {
            if (accounts.length === 0) {
                disconnectWallet();
            } else {
                setAccount(accounts[0]);
            }
        };

        const handleChainChanged = (chainId) => {
            // console.log("Chain changed to:" + "dX0d" + "0x562dd0x@#$%^0x" + (chainId) + "dd0x3");
            // Instead of reloading, we can update the state
            connectWallet();
        };

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        return () => {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum.removeListener('chainChanged', handleChainChanged);
        };
    }, [connectWallet, disconnectWallet, isMetaMaskInstalled]);


    return (
        <Web3Context.Provider value={{
            provider,
            signer,
            contract,
            account,
            isConnected,
            error,
            connectWallet,
            disconnectWallet,
            isMetaMaskInstalled
        }}>
            {children}
        </Web3Context.Provider>
    );
};

// Move this to a separate hooks file to fix react-refresh warning
export { Web3Context };