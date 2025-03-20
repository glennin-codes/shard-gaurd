import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import { useTelegram } from '../context/TelegramContext';
import { useShares } from '../context/SharesContext';
import {
  generatePrivateKey,
  splitPrivateKey,
  getAddressFromPrivateKey,
  isValidPrivateKey,
} from '../utils/shamir';

const KeyGenerator = () => {
  const [privateKey, setPrivateKey] = useState('');
  const [totalShares, setTotalShares] = useState(3);
  const [threshold, setThreshold] = useState(2);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { user } = useTelegram();
  const { saveShares, userShares } = useShares();

  const handleGenerateKey = () => {
    setIsLoading(true);
    
    try {
      const newKey = generatePrivateKey();
      setPrivateKey(newKey);
      setAddress(getAddressFromPrivateKey(newKey));
      setStep(2);
    } catch (error) {
      console.error('Failed to generate key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportKey = () => {
    if (!isValidPrivateKey(privateKey)) {
      return;
    }

    setIsLoading(true);
    
    try {
      setAddress(getAddressFromPrivateKey(privateKey));
      setStep(2);
    } catch (error) {
      console.error('Failed to import key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSplitKey = () => {
    if (!privateKey || !user?.id) return;

    setIsLoading(true);
    
    try {
      const shares = splitPrivateKey(privateKey, {
        totalShares,
        threshold,
      });
      
      saveShares(user.id, shares);
      setStep(3);
    } catch (error) {
      console.error('Failed to split key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepOne = () => (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <Input
          label="Import Existing Private Key (Optional)"
          placeholder="Enter your private key (64 hex characters)"
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          fullWidth
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Or generate a new key by clicking the button below
        </p>
      </div>

      <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
        <Button
          onClick={handleGenerateKey}
          isLoading={isLoading}
          fullWidth
        >
          Generate New Key
        </Button>
        <Button
          onClick={handleImportKey}
          disabled={!privateKey || !isValidPrivateKey(privateKey) || isLoading}
          variant="secondary"
          fullWidth
        >
          Use Imported Key
        </Button>
      </div>
    </div>
  );

  const renderStepTwo = () => (
    <div className="space-y-6">
      <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Your Address
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-200">
              <p className="break-all font-mono">{address}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Total Shares"
            type="number"
            min={2}
            max={10}
            value={totalShares}
            onChange={(e) => setTotalShares(parseInt(e.target.value))}
            fullWidth
          />
          <Input
            label="Threshold (Min. Shares)"
            type="number"
            min={2}
            max={totalShares}
            value={threshold}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setThreshold(Math.min(value, totalShares));
            }}
            fullWidth
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your private key will be split into {totalShares} shares. You will need at least {threshold} shares to reconstruct it.
        </p>
      </div>

      <div className="flex space-x-3">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button
          onClick={handleSplitKey}
          isLoading={isLoading}
          fullWidth
        >
          Split My Key
        </Button>
      </div>
    </div>
  );

  const renderStepThree = () => (
    <div className="space-y-6">
      <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-green-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
              Key Successfully Split
            </h3>
            <div className="mt-2 text-sm text-green-700 dark:text-green-200">
              <p>
                Your private key has been split into {totalShares} shares, requiring {threshold} to reconstruct.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
          Your Key Shares
        </h3>
        <div className="max-h-60 space-y-2 overflow-y-auto rounded-md bg-slate-100 p-3 dark:bg-slate-700/50">
          {userShares?.map((share, index) => (
            <div
              key={index}
              className="break-all rounded border border-slate-200 bg-white p-2 font-mono text-xs dark:border-slate-600 dark:bg-slate-800"
            >
              {share}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          These shares are stored securely with your Telegram account. Keep them safe!
        </p>
      </div>

      <div className="flex space-x-3">
        <Button variant="outline" onClick={() => setStep(1)}>
          Create New Key
        </Button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStepOne();
      case 2:
        return renderStepTwo();
      case 3:
        return renderStepThree();
      default:
        return renderStepOne();
    }
  };

  const stepsInfo = [
    { name: 'Generate', status: step > 1 ? 'complete' : 'current' },
    { name: 'Configure', status: step > 2 ? 'complete' : step === 2 ? 'current' : 'upcoming' },
    { name: 'Split', status: step === 3 ? 'current' : 'upcoming' },
  ];

  return (
    <Card title="Key Management" className="max-w-lg">
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol role="list" className="flex items-center">
            {stepsInfo.map((stepInfo, stepIdx) => (
              <li
                key={stepInfo.name}
                className={`${
                  stepIdx !== stepsInfo.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                      stepInfo.status === 'complete'
                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                        : stepInfo.status === 'current'
                        ? 'border-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                        : 'border-2 border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {stepInfo.status === 'complete' ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      stepIdx + 1
                    )}
                  </div>
                  <div
                    className={`${
                      stepIdx !== stepsInfo.length - 1 ? 'ml-4 w-full' : ''
                    }`}
                  >
                    <div
                      className={`${
                        stepIdx !== stepsInfo.length - 1
                          ? 'h-0.5 w-full bg-slate-200 dark:bg-slate-700'
                          : ''
                      }`}
                    />
                  </div>
                </div>
                <div className="mt-2 text-center text-xs">
                  <p
                    className={`${
                      stepInfo.status === 'complete'
                        ? 'text-blue-600 dark:text-blue-400'
                        : stepInfo.status === 'current'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {stepInfo.name}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {renderCurrentStep()}
    </Card>
  );
};

export default KeyGenerator; 