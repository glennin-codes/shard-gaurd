import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// Import but also prepare for direct window.Telegram usage
import WebApp from '@twa-dev/sdk';

// Define an interface for the Telegram WebApp global object
interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
    };
  };
  colorScheme: 'light' | 'dark';
  onEvent: (eventName: string, callback: () => void) => void;
}

interface TelegramContextType {
  user: {
    id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  } | null;
  isDarkMode: boolean;
  toggleTheme: () => void;
  ready: boolean;
  error: string | null;
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  isDarkMode: false,
  toggleTheme: () => {},
  ready: false,
  error: null
});

export const TelegramProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<TelegramContextType['user']>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('TelegramContext: Initializing...');
    
    // Set a timeout to ensure the app renders even if WebApp initialization fails
    const fallbackTimer = setTimeout(() => {
      if (!ready) {
        console.warn('TelegramContext: Fallback timer triggered - forcing ready state');
        setUser({ id: 'fallback123' });
        setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
        setReady(true);
      }
    }, 3000);
    
    // Initialize Telegram Web App
    try {
      // Check if we're in development environment
      const isDev = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.protocol === 'file:';
      
      if (isDev) {
        console.log('TelegramContext: Running in development mode');
        setUser({ id: 'dev123456789' });
        setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
        setReady(true);
        clearTimeout(fallbackTimer);
        return;
      }
      
      // Try to use the global Telegram object
      const telegramWebApp: TelegramWebApp | undefined = 
        // @ts-ignore - window.Telegram might not be defined in TypeScript
        typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
      
      if (telegramWebApp) {
        console.log('TelegramContext: Using global Telegram.WebApp object');
        
        // Extract user from Telegram Mini App
        if (telegramWebApp.initDataUnsafe && telegramWebApp.initDataUnsafe.user) {
          console.log('TelegramContext: User data found', telegramWebApp.initDataUnsafe.user);
          setUser({
            id: telegramWebApp.initDataUnsafe.user.id.toString(),
            username: telegramWebApp.initDataUnsafe.user.username,
            firstName: telegramWebApp.initDataUnsafe.user.first_name,
            lastName: telegramWebApp.initDataUnsafe.user.last_name,
          });
        } else {
          console.warn('TelegramContext: No user data in telegramWebApp.initDataUnsafe');
          // Still continue with a fallback user
          setUser({ id: 'user123456789' });
        }

        // Set initial theme based on Telegram settings
        setIsDarkMode(telegramWebApp.colorScheme === 'dark');
        console.log('TelegramContext: Color scheme is', telegramWebApp.colorScheme);

        // Listen for theme changes from Telegram
        telegramWebApp.onEvent('themeChanged', () => {
          console.log('TelegramContext: Theme changed to', telegramWebApp.colorScheme);
          setIsDarkMode(telegramWebApp.colorScheme === 'dark');
        });

        // Set ready state
        setReady(true);
        console.log('TelegramContext: Ready with global Telegram object');
        clearTimeout(fallbackTimer);
        return;
      }
      
      // Fall back to the imported WebApp if global Telegram object is not available
      console.log('TelegramContext: Falling back to @twa-dev/sdk');
      
      // Check if WebApp is defined
      if (typeof WebApp === 'undefined') {
        console.error('TelegramContext: WebApp is undefined');
        setError('Telegram WebApp SDK not loaded');
        setUser({ id: 'error123456789' });
        setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
        setReady(true);
        clearTimeout(fallbackTimer);
        return;
      }
      
      // Handle production environment
      console.log('TelegramContext: WebApp object available:', !!WebApp);
      
      // Sometimes WebApp.initData might be empty initially
      // Use a small delay to ensure it's loaded
      setTimeout(() => {
        try {
          if (WebApp.initData) {
            console.log('TelegramContext: WebApp.initData is available');
            
            // Extract user from Telegram Mini App
            if (WebApp.initDataUnsafe && WebApp.initDataUnsafe.user) {
              console.log('TelegramContext: User data found', WebApp.initDataUnsafe.user);
              setUser({
                id: WebApp.initDataUnsafe.user.id.toString(),
                username: WebApp.initDataUnsafe.user.username,
                firstName: WebApp.initDataUnsafe.user.first_name,
                lastName: WebApp.initDataUnsafe.user.last_name,
              });
            } else {
              console.warn('TelegramContext: No user data in WebApp.initDataUnsafe');
              // Still continue with a fallback user
              setUser({ id: 'user123456789' });
            }

            // Set initial theme based on Telegram settings
            setIsDarkMode(WebApp.colorScheme === 'dark');
            console.log('TelegramContext: Color scheme is', WebApp.colorScheme);

            // Listen for theme changes from Telegram
            WebApp.onEvent('themeChanged', () => {
              console.log('TelegramContext: Theme changed to', WebApp.colorScheme);
              setIsDarkMode(WebApp.colorScheme === 'dark');
            });

            // Set ready state
            setReady(true);
            console.log('TelegramContext: Ready with sdk');
          } else {
            console.warn('TelegramContext: WebApp.initData is not available, using fallback');
            // Provide fallback to ensure the app works
            setUser({ id: 'user987654321' });
            setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
            setReady(true);
          }
        } catch (err) {
          console.error('Failed inside setTimeout:', err);
          setUser({ id: 'error123456789' });
          setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
          setReady(true);
        }
        
        clearTimeout(fallbackTimer);
      }, 500);
    } catch (error) {
      console.error('Failed to initialize Telegram Web App:', error);
      setError(`Initialization error: ${error instanceof Error ? error.message : String(error)}`);
      // Provide fallback for local development
      setUser({ id: 'dev123456789' });
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
      setReady(true);
      clearTimeout(fallbackTimer);
    }
    
    return () => {
      clearTimeout(fallbackTimer);
    };
  }, []);

  // Update HTML theme class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Toggle theme manually
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <TelegramContext.Provider value={{ user, isDarkMode, toggleTheme, ready, error }}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => useContext(TelegramContext); 