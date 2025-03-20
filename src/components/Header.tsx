import { motion } from 'framer-motion';
import { useTelegram } from '../context/TelegramContext';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { user, isDarkMode } = useTelegram();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex items-center justify-between"
    >
      <div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-slate-800 dark:text-white"
        >
          Shard Guard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-slate-500 dark:text-slate-400"
        >
          Secure your keys with Shamir Secret Sharing
        </motion.p>
      </div>

      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <div className="flex items-center space-x-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              isDarkMode ? 'bg-blue-500' : 'bg-blue-600'
            } text-white`}
          >
            {user?.firstName?.[0] || 'T'}
          </div>
          <div className="hidden text-sm sm:block">
            <p className="font-medium text-slate-700 dark:text-slate-200">
              {user?.firstName || 'Telegram User'}
            </p>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header; 