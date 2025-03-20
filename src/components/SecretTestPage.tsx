import { useState, useEffect } from 'react';
import { initializeSecrets, generatePrivateKey } from '../utils/shamir';
import Button from './Button';

const SecretTestPage = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  // Initialize on component mount
  useEffect(() => {
    const init = async () => {
      try {
        console.log('Test page: Attempting to initialize security features...');
        const success = await initializeSecrets();
        console.log('Test page: Initialization result:', success);
        setIsInitialized(success);
      } catch (err) {
        console.error('Test page: Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };
    
    init();
  }, []);
  
  const runTest = () => {
    try {
      // Generate a key to test if the library is working
      const key = generatePrivateKey();
      setTestResult(`Generated key: ${key.substring(0, 6)}...${key.substring(key.length - 6)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error during test');
    }
  };
  
  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Secrets.js Test Page</h2>
      
      <div className="mb-4 p-2 border rounded">
        <p className="font-semibold">Initialization Status:</p>
        <p className={isInitialized ? "text-green-600" : "text-red-600"}>
          {isInitialized ? "✅ Initialized" : "❌ Not initialized"}
        </p>
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 border border-red-300 rounded">
          <p className="font-semibold">Error:</p>
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {testResult && (
        <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
          <p className="font-semibold">Test Result:</p>
          <p className="text-green-700">{testResult}</p>
        </div>
      )}
      
      <Button 
        onClick={runTest} 
        disabled={!isInitialized}
        className={!isInitialized ? "opacity-50 cursor-not-allowed" : ""}
      >
        Run Test
      </Button>
    </div>
  );
};

export default SecretTestPage; 