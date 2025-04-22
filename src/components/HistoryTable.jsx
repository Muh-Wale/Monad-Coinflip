import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../hooks/useWeb3';

const HistoryTable = () => {
    const { contract, account } = useWeb3();
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!contract) return;
            
            setIsLoading(true);
            setError(null);

            try {
                const historyCount = await contract.getFlipHistoryCount();
                const allHistory = [];

                // Get last 10 flips
                const start = Math.max(0, Number(historyCount) - 10);
                for (let i = start; i < historyCount; i++) {
                    const flip = await contract.flipHistory(i);
                    allHistory.push({
                        player: flip.player,
                        choice: flip.choice ? 'Heads' : 'Tails',
                        outcome: flip.outcome ? 'Heads' : 'Tails',
                        amount: ethers.formatEther(flip.amount),
                        payout: ethers.formatEther(flip.payout),
                        timestamp: new Date(Number(flip.timestamp) * 1000).toLocaleString(),
                    });
                }

                setHistory(allHistory.reverse());
            } catch (error) {
                console.error("Error fetching history:", error);
                setError("Failed to load history. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();

        // Correct event listener
        const listener = async (player, choice, outcome, amount, payout, event) => {
            try {
                const block = await event.getBlock();
                setHistory(prev => [{
                    player,
                    choice: choice ? 'Heads' : 'Tails',
                    outcome: outcome ? 'Heads' : 'Tails',
                    amount: ethers.formatEther(amount),
                    payout: ethers.formatEther(payout),
                    timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
                }, ...prev.slice(0, 9)]);
            } catch (err) {
                console.error("Error processing new flip:", err);
            }
        };

        contract?.on('Flipped', listener);
        return () => contract?.off('Flipped', listener);
    }, [contract]);

    console.log("Contract:", contract);

    return (
        <div className="overflow-x-scroll overflow-y-auto max-h-[512px] scrollbar-hide">
            <table className="min-w-full divide-y divide-gray-700">
                <thead>
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Result</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Bet</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Payout</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Time</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {history.map((item, index) => (
                        <tr key={index} className={item.player.toLowerCase() === account?.toLowerCase() ? 'bg-gray-700/50' : ''}>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.choice === item.outcome ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'
                                    }`}>
                                    {item.choice === item.outcome ? 'Won' : 'Lost'}
                                </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                {item.amount} MON ({item.choice})
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                {item.payout !== '0.0' ? `${item.payout} MON` : '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                                {item.timestamp}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {isLoading ? (
                <p className="text-center text-gray-500 py-4">Loading history...</p>
            ) : error ? (
                <p className="text-center text-red-500 py-4">Reconnect Your Wallet</p>
            ) : history.length === 0 && (
                <p className="text-center text-gray-500 py-4">No flip history yet</p>
            )}
        </div>
    );
};

export default HistoryTable;