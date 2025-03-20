import { useState } from "react";
import { TelegramProvider } from "./context/TelegramContext";
import { SharesProvider } from "./context/SharesContext";
import Layout from "./components/Layout";
import KeyGenerator from "./components/KeyGenerator";
import KeyRecovery from "./components/KeyRecovery"
import { Toaster } from "react-hot-toast";

function App() {
  const [activeTab, setActiveTab] = useState<"generate" | "recover" | "test">("generate");
  
  return (
    <TelegramProvider>
      <SharesProvider>
        <Layout>
          <div className="flex flex-col items-center justify-center">
            <div className="mb-6 w-full max-w-lg  ">
              <div className="mb-2 flex border-b  gap-4 border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setActiveTab("generate")}
                  className={`px-4 py-2 text-sm font-medium mr-2 ${
                    activeTab === "generate"
                      ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                      : "text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-300"
                  }`}
                >
                  Generate & Split Key
                </button>
                <button
                  onClick={() => setActiveTab("recover")}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "recover"
                      ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                      : "text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-300"
                  }`}
                >
                  Recover Key
                </button>
            
              </div>
            </div>

            {activeTab === "generate" && <KeyGenerator />}
            {activeTab === "recover" && <KeyRecovery />}
          
          </div>
        </Layout>
        <Toaster position="top-right" />
      </SharesProvider>
    </TelegramProvider>
  );
}

export default App;
