import { useWeb3 } from '../hooks/useWeb3';

const WalletButton = () => {
    const {
        account,
        isConnected,
        error,
        connectWallet,
        disconnectWallet
    } = useWeb3();

    const isMetaMaskInstalled = () => {
        return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
    };

    const formatAddress = (addr) =>
        `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

    if (!isMetaMaskInstalled()) {
        return (
            <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-medium"
            >
                Install MetaMask
            </a>
        );
    }

    return (
        <div className="flex items-center gap-4">
            {error && (
                <span className="text-red-500 text-sm">{error}</span>
            )}
            {isConnected ? (
                <button
                    onClick={disconnectWallet}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium"
                >
                    {formatAddress(account)}
                </button>
            ) : (
                <button
                    onClick={connectWallet}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg text-white font-medium hover:opacity-90"
                >
                    Connect MetaMask
                </button>
            )}
        </div>
    );
};

export default WalletButton;