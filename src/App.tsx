import { TelegramProvider } from './context/TelegramContext';
import { SharesProvider } from './context/SharesContext';
import Layout from './components/Layout';
import KeyGenerator from './components/KeyGenerator';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <TelegramProvider>
      <SharesProvider>
        <Layout>
          <div className="flex flex-col items-center justify-center">
            <KeyGenerator />
          </div>
        </Layout>
        <Toaster position="top-right" />
      </SharesProvider>
    </TelegramProvider>
  );
}

export default App;
