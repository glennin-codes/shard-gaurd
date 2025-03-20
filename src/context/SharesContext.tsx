import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useTelegram } from './TelegramContext';

interface SharesData {
  [telegramId: string]: string[];
}

interface SharesContextType {
  saveShares: (telegramId: string, shares: string[]) => void;
  getShares: (telegramId: string) => string[] | null;
  deleteShares: (telegramId: string) => void;
  userShares: string[] | null;
}

const STORAGE_KEY = 'telegram_key_shares';

const SharesContext = createContext<SharesContextType>({
  saveShares: () => {},
  getShares: () => null,
  deleteShares: () => {},
  userShares: null,
});

export const SharesProvider = ({ children }: { children: ReactNode }) => {
  const [sharesData, setSharesData] = useState<SharesData>({});
  const { user } = useTelegram();
  const [userShares, setUserShares] = useState<string[] | null>(null);

  // Load shares from localStorage on init
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData) as SharesData;
        setSharesData(parsedData);
        
        // Set user shares if user exists
        if (user && user.id && parsedData[user.id]) {
          setUserShares(parsedData[user.id]);
        }
      }
    } catch (error) {
      console.error('Failed to load shares from localStorage:', error);
    }
  }, [user]);

  // Update userShares when user changes
  useEffect(() => {
    if (user && user.id && sharesData[user.id]) {
      setUserShares(sharesData[user.id]);
    } else {
      setUserShares(null);
    }
  }, [user, sharesData]);

  const saveToLocalStorage = (data: SharesData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save shares to localStorage:', error);
    }
  };

  const saveShares = (telegramId: string, shares: string[]) => {
    setSharesData((prev) => {
      const newData = { ...prev, [telegramId]: shares };
      saveToLocalStorage(newData);
      return newData;
    });
  };

  const getShares = (telegramId: string): string[] | null => {
    return sharesData[telegramId] || null;
  };

  const deleteShares = (telegramId: string) => {
    setSharesData((prev) => {
      const newData = { ...prev };
      delete newData[telegramId];
      saveToLocalStorage(newData);
      return newData;
    });
  };

  return (
    <SharesContext.Provider value={{ saveShares, getShares, deleteShares, userShares }}>
      {children}
    </SharesContext.Provider>
  );
};

export const useShares = () => useContext(SharesContext); 