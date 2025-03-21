import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useTelegram } from "./TelegramContext";

interface SharesData {
  [telegramId: string]: string[];
}

interface SharesContextType {
  saveShares: (telegramId: string, shares: string[]) => Promise<boolean>;
  getShares: (telegramId: string) => string[] | null;
  deleteShares: (telegramId: string) => Promise<boolean>;
  userShares: string[] | null;
  isLoading: boolean;
}

// File name for storing shares
const STORAGE_KEY = "telegram_key_shares"; // localStorage key for storing shares data

const SharesContext = createContext<SharesContextType>({
  saveShares: async () => false,
  getShares: () => null,
  deleteShares: async () => false,
  userShares: null,
  isLoading: false,
});

export const SharesProvider = ({ children }: { children: ReactNode }) => {
  const [sharesData, setSharesData] = useState<SharesData>({});
  const [userShares, setUserShares] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useTelegram();

  // Load shares data on init and when user changes
  useEffect(() => {
    const loadShares = async () => {
      setIsLoading(true);
      try {
        // Load from localStorage
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
        console.error("Failed to load shares from localStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadShares();
  }, [user]);

  // Update userShares when user changes
  useEffect(() => {
    if (user && user.id && sharesData[user.id]) {
      setUserShares(sharesData[user.id]);
    } else {
      setUserShares(null);
    }
  }, [user, sharesData]);

  // Save data to localStorage
  const saveSharesData = async (newData: SharesData): Promise<boolean> => {
    try {
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      return true;
    } catch (error) {
      console.error("Failed to save shares to localStorage:", error);
      return false;
    }
  };

  const saveShares = async (telegramId: string, shares: string[]): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newData = { ...sharesData, [telegramId]: shares };
      const success = await saveSharesData(newData);

      if (success) {
        setSharesData(newData);
        if (user && user.id === telegramId) {
          setUserShares(shares);
        }
      }

      return success;
    } catch (error) {
      console.error("Error saving shares:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getShares = (telegramId: string): string[] | null => {
    return sharesData[telegramId] || null;
  };

  const deleteShares = async (telegramId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newData = { ...sharesData };
      delete newData[telegramId];

      const success = await saveSharesData(newData);

      if (success) {
        setSharesData(newData);
        if (user && user.id === telegramId) {
          setUserShares(null);
        }
      }

      return success;
    } catch (error) {
      console.error("Error deleting shares:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SharesContext.Provider value={{ saveShares, getShares, deleteShares, userShares, isLoading }}>
      {children}
    </SharesContext.Provider>
  );
};

export const useShares = () => useContext(SharesContext);
