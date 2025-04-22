import { Web3Provider } from './context/Web3Context';
import Header from './components/Header';
import BetControls from './components/BetControls';
import HistoryTable from './components/HistoryTable';
import { useState } from 'react';

function App() {
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  return (
    <Web3Provider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <Header />
          
          <main className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                <BetControls isHistoryLoading={isHistoryLoading} />
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl px-6 pt-6 shadow-lg h-full">
                <h2 className="text-xl font-bold mb-4">Flip History</h2>
                <HistoryTable setIsHistoryLoading={setIsHistoryLoading} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </Web3Provider>
  );
}

export default App;