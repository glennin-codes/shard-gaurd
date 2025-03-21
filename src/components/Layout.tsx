import { ReactNode, useEffect, useState } from "react";
import { useTelegram } from "../context/TelegramContext";
import AnimatedBackground from "./AnimatedBackground";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { ready, error, debug } = useTelegram();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  //enable ed

  // Set a fallback timer to prevent getting stuck on loading screen
  useEffect(() => {
    //add logs
    console.log("Layout useEffect");
    const timer = setTimeout(() => {
      console.log("Layout useEffect timeout");
      if (!ready) {
        console.log("Layout useEffect timeout ready false");
        setLoadingTimeout(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [ready]);

  // Show loading indicator while initializing
  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="mb-2 text-slate-800 dark:text-slate-200">
          {loadingTimeout ? "Taking longer than expected..." : "Initializing app..."}
        </p>
        {loadingTimeout && (
          <div className="max-w-md">
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              The app is taking longer than expected to load. If you're using this app in Telegram,
              try refreshing or opening it directly from the Telegram app.
            </p>
            <div className="flex gap-3">
              <button
                className="rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
              <button
                className="rounded-lg bg-slate-600 px-4 py-2 text-white transition hover:bg-slate-700"
                onClick={debug}
              >
                Debug
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show error message if there was a problem
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
          Initialization Error
        </h2>
        <p className="mb-4 text-slate-700 dark:text-slate-300">{error}</p>
        <div className="flex gap-3">
          <button
            className="rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
          <button
            className="rounded-lg bg-slate-600 px-4 py-2 text-white transition hover:bg-slate-700"
            onClick={debug}
          >
            Show Debug Info
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
      <AnimatedBackground />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
