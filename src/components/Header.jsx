import WalletButton from './WalletButton';

const Header = () => {
    return (
        <header className="flex justify-between items-center">
            <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-xs md:text-base font-bold">MF</span>
                </div>
                <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Monad Coin Flip
                </h1>
            </div>
            <WalletButton />
        </header>
    );
};

export default Header;