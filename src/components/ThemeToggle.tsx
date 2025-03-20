import { motion } from 'framer-motion';
import { useTelegram } from '../context/TelegramContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTelegram();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-200 p-1 shadow-inner dark:bg-gray-700"
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow dark:bg-blue-500"
        layout
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30
        }}
        animate={{
          x: isDarkMode ? 24 : 0,
        }}
      >
        {isDarkMode ? (
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle; 