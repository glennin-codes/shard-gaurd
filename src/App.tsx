import { useState } from 'react';
import { TelegramProvider } from './context/TelegramContext';
import { SharesProvider } from './context/SharesContext';
import Layout from './components/Layout';
import KeyGenerator from './components/KeyGenerator';
import SecretTestPage from './components/SecretTestPage';
import { Toaster } from 'react-hot-toast';

function App() {
  const [showTestPage, setShowTestPage] = useState(false);
  
  return (
    <TelegramProvider>
      <SharesProvider>
        <Layout>
          <div className="flex flex-col items-center justify-center">
            <div className="mb-4 w-full flex justify-end">
              <button 
                onClick={() => setShowTestPage(!showTestPage)}
                className="text-sm bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
              >
                {showTestPage ? 'Show Main App' : 'Show Test Page'}
              </button>
            </div>
            
            {showTestPage ? <SecretTestPage /> : <KeyGenerator />}
          </div>
        </Layout>
        <Toaster position="top-right" />
      </SharesProvider>
    </TelegramProvider>
  );
}

export default App;
