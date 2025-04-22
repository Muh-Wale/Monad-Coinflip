import { useEffect, useState } from 'react';
import headsImage from '../assets/coin-heads.png';
import tailsImage from '../assets/coin-tails.png';

const CoinFlipAnimation = ({ isFlipping, result, selectedSide }) => {
    const [rotation, setRotation] = useState(0);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        let interval;
        if (isFlipping) {
            setShowResult(false);
            interval = setInterval(() => {
                setRotation(prev => prev + 30);
            }, 100);
        } else if (result) {
            setShowResult(true);
            setRotation(0);
        }

        return () => clearInterval(interval);
    }, [isFlipping, result]);

    const getCoinImage = () => {
        if (showResult) {
            return result.won ? headsImage : tailsImage;
        }
        return selectedSide === 'heads' ? headsImage : tailsImage;
    };

    return (
        <div className="flex justify-center my-8">
            <div
                className="w-32 h-32 relative"
                style={{
                    transform: `rotateY(${rotation}deg)`,
                    transition: isFlipping ? 'transform 0.1s linear' : 'transform 0.5s ease-out'
                }}
            >
                <img
                    src={getCoinImage()}
                    alt="coin"
                    className="w-full h-full object-contain"
                />
            </div>
        </div>
    );
};

export default CoinFlipAnimation;