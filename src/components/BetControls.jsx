import { useState, useEffect } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { ethers } from 'ethers';
import CoinFlipAnimation from './CoinFlipAnimation';

const BetControls = () => {
    const { signer, isConnected, account } = useWeb3();
    const [betAmount, setBetAmount] = useState(1);
    const [selectedSide, setSelectedSide] = useState('heads');
    const [isFlipping, setIsFlipping] = useState(false);
    const [result, setResult] = useState(null);
    const [contract, setContract] = useState(null);
    const [error, setError] = useState(null);

    // Replace with your deployed contract address and ABI
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

    useEffect(() => {
        if (signer && !contract) {
            const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            setContract(contractInstance);
        }
    }, [signer, CONTRACT_ABI]);

    const handleFlip = async () => {
        if (!isConnected || !contract || !account) {
            setError('Please connect your wallet first');
            return;
        }

        try {
            setIsFlipping(true);
            setError(null);
    
            const tx = await contract.flip(selectedSide === 'heads', {
                value: ethers.parseEther(betAmount.toString())
            });

            // Wait for transaction to be mined
            const receipt = await tx.wait();

            // Get the emitted event
            const event = receipt.logs?.find(log =>
                log.address === CONTRACT_ADDRESS &&
                log.topics[0] === contract.interface.getEvent('Flipped').topicHash
            );

            if (event) {
                const parsedEvent = contract.interface.parseLog(event);
                setResult({
                    won: parsedEvent.args.outcome === (selectedSide === 'heads'),
                    amount: ethers.formatEther(parsedEvent.args.amount),
                    payout: parsedEvent.args.payout ? ethers.formatEther(parsedEvent.args.payout) : '0'
                });
            }
        } catch (err) {
            console.error("Flip error:", err);
            if (err.message.includes('insufficient funds')) {
                setError('Insufficient MON balance for this transaction');
            } else {
                setError(err.message || 'Transaction failed. Please try again.');
            }
            
        } finally {
            setIsFlipping(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Monad Coin Flip</h1>

            {error && (
                <div className="mb-4 p-3 bg-red-900/50 rounded-lg text-red-300">
                    {error}
                </div>
            )}

<div className="mb-6">
                <label className="block text-sm font-medium mb-2">Bet Amount (1-20 MON)</label>
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-2">
                    <span>1 MON</span>
                    <span className="text-purple-400 font-bold">{betAmount} MON</span>
                    <span>20 MON</span>
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Choose Side</label>
                <div className="flex gap-4">
                    <button
                        onClick={() => setSelectedSide('heads')}
                        className={`flex-1 py-3 rounded-lg border-2 transition-all ${selectedSide === 'heads'
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-gray-600 hover:border-gray-500'
                            }`}
                    >
                        Heads
                    </button>
                    <button
                        onClick={() => setSelectedSide('tails')}
                        className={`flex-1 py-3 rounded-lg border-2 transition-all ${selectedSide === 'tails'
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-gray-600 hover:border-gray-500'
                            }`}
                    >
                        Tails
                    </button>
                </div>
            </div>

            <CoinFlipAnimation isFlipping={isFlipping} result={result} selectedSide={selectedSide} />

            <button
                onClick={handleFlip}
                disabled={!isConnected || isFlipping}
                className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all ${isConnected
                    ? 'bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90'
                    : 'bg-gray-600 cursor-not-allowed'
                    }`}
            >
                {isConnected ? (isFlipping ? 'Flipping...' : 'Flip Coin') : 'Connect Wallet to Play'}
            </button>

            {result && (
                <div className={`mt-4 p-4 rounded-lg ${result.won ? 'bg-green-900/50' : 'bg-red-900/50'
                    }`}>
                    {result.won ? (
                        <p className="text-green-400">You won {result.payout} MON!</p>
                    ) : (
                        <p className="text-red-400">You lost {result.amount} MON</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BetControls;