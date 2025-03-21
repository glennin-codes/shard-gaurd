import { useState } from "react";
import { motion } from "framer-motion";
import Button from "./Button";
import Input from "./Input";
import Card from "./Card";
import { useTelegram } from "../context/TelegramContext";
import { useShares } from "../context/SharesContext";
import { splitPrivateKey, combineShares } from "../utils/shamir";
import { toast } from "react-hot-toast";

const KeyGenerator = () => {
  const [secret, setSecret] = useState("");
  const [totalShares, setTotalShares] = useState(3);
  const [threshold, setThreshold] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { user } = useTelegram();
  const { saveShares, userShares } = useShares();

  const handleGenerateRandomSecret = () => {
    setIsLoading(true);

    try {
      // Generate a random string for the secret
      const randomValues = new Uint8Array(32);
      crypto.getRandomValues(randomValues);
      const newSecret = Array.from(randomValues)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      setSecret(newSecret);
      setStep(2);
    } catch (error) {
      console.error("Failed to generate random secret:", error);
      toast.error(
        "Failed to generate random secret: " +
          (error instanceof Error ? error.message : "Please try again."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseEnteredSecret = () => {
    if (!secret.trim()) {
      toast.error("Please enter a secret to split.");
      return;
    }

    setStep(2);
  };

  const handleSplitSecret = async () => {
    if (!secret || !user?.id) {
      toast.error("Missing secret or user information.");
      return;
    }

    setIsLoading(true);

    try {
      // Validate threshold isn't bigger than total shares
      if (threshold > totalShares) {
        throw new Error("Threshold cannot be greater than total shares");
      }

      console.log("Attempting to split secret with", { totalShares, threshold });
      const shares = await splitPrivateKey(secret, {
        totalShares,
        threshold,
      });

      // Save shares using telegramId as key
      const saveResult = await saveShares(user.id, shares);

      if (!saveResult) {
        throw new Error("Failed to save your shares. Please try again.");
      }

      // Test combinations (this is for debugging only)
      if (shares.length >= 2) {
        console.log("Testing share combinations for recovery:");
        await testShareCombinations(shares, threshold, secret);
      }

      setStep(3);
      toast.success("Secret successfully split into shares!");
    } catch (error) {
      console.error("Failed to split secret:", error);
      toast.error(
        "Failed to split secret: " + (error instanceof Error ? error.message : "Please try again."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Test function to verify all combinations work
  const testShareCombinations = async (
    shares: string[],
    threshold: number,
    expectedSecret: string,
  ) => {
    // Generate all possible combinations of shares that meet the threshold
    const combinations = generateCombinations(shares, threshold);

    console.log(`Testing ${combinations.length} possible combinations of ${threshold} shares`);

    for (const combo of combinations) {
      try {
        console.log(`Testing combination of ${combo.length} shares`);
        const recoveredSecret = await combineShares(combo);

        if (recoveredSecret === expectedSecret) {
          console.log(`✅ Combination successfully recovered the secret`);
        } else {
          console.error(`❌ Combination recovered an INCORRECT secret`);
        }
      } catch (error) {
        console.error(`❌ Failed to recover with combination: ${error}`);
      }
    }
  };

  // Helper function to generate all possible combinations of shares
  const generateCombinations = (shares: string[], size: number): string[][] => {
    if (size > shares.length) return [];
    if (size === shares.length) return [shares];
    if (size === 1) return shares.map((share) => [share]);

    const result: string[][] = [];

    for (let i = 0; i < shares.length; i++) {
      const firstElement = shares[i];
      const remainingElements = shares.slice(i + 1);
      const subCombinations = generateCombinations(remainingElements, size - 1);

      for (const subCombination of subCombinations) {
        result.push([firstElement, ...subCombination]);
      }
    }

    return result;
  };

  const renderStepOne = () => (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <Input
          label="Enter Your Secret"
          placeholder="Enter the text you wish to split into shares"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          fullWidth
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enter any text you wish to secure using Shamir's Secret Sharing. This could be a password,
          a private key, a recovery phrase, or any sensitive information.
        </p>
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
          <Button onClick={handleUseEnteredSecret} disabled={!secret.trim() || isLoading} fullWidth>
            Use This Secret
          </Button>
          <Button
            onClick={handleGenerateRandomSecret}
            isLoading={isLoading}
            variant="secondary"
            fullWidth
          >
            Generate Random Secret
          </Button>
        </div>
      </div>
    </div>
  );

  const renderStepTwo = () => (
    <div className="space-y-6">
      <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Your Secret</h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-200">
              <p className="break-all font-mono">
                {secret.length > 100 ? `${secret.substring(0, 100)}...` : secret}
              </p>
              <p className="mt-1 text-xs">Length: {secret.length} characters</p>
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
          Your secret will be split into {totalShares} shares. You will need at least {threshold}{" "}
          shares to reconstruct it.
        </p>
      </div>

      <div className="flex space-x-3">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button onClick={handleSplitSecret} isLoading={isLoading} fullWidth>
          Split My Secret
        </Button>
      </div>
    </div>
  );

  const renderStepThree = () => (
    <div className="space-y-6">
      <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
              Secret Successfully Split
            </h3>
            <div className="mt-2 text-sm text-green-700 dark:text-green-200">
              <p>
                Your secret has been split into {totalShares} shares, requiring {threshold} to
                reconstruct.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Your Shares</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          These shares are stored securely with your Telegram account. When recovering your secret,
          you'll need to provide at least {threshold} of these shares.
        </p>
        <div className="max-h-60 space-y-2 overflow-y-auto rounded-md bg-slate-100 p-3 dark:bg-slate-700/50">
          {userShares?.map((share, index) => {
            return (
              <div
                key={index}
                className="rounded border border-slate-200 bg-white p-3 font-mono text-xs dark:border-slate-600 dark:bg-slate-800"
              >
                <div className="flex justify-between">
                  <span className="font-semibold">Share #{index + 1}</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    Requires {threshold} to recover
                  </span>
                </div>
                <div className="mt-2 break-all">
                  <span className="text-slate-500 dark:text-slate-400">Share value: </span>
                  <span className="select-all font-medium">{share}</span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  <span>☝️ Copy this entire share value for recovery</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          To recover your secret later, go to the "Recover Key" tab and paste in {threshold} or more
          of these share values.
        </p>
      </div>

      <div className="flex space-x-3">
        <Button variant="outline" onClick={() => setStep(1)}>
          Split Another Secret
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
    { name: "Enter Secret", status: step > 1 ? "complete" : "current" },
    { name: "Configure", status: step > 2 ? "complete" : step === 2 ? "current" : "upcoming" },
    { name: "Split", status: step === 3 ? "current" : "upcoming" },
  ];

  return (
    <Card title="Secret Sharing" className="max-w-lg">
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol role="list" className="flex items-center">
            {stepsInfo.map((stepInfo, stepIdx) => (
              <li
                key={stepInfo.name}
                className={`${stepIdx !== stepsInfo.length - 1 ? "flex-1" : ""}`}
              >
                <div className="flex items-center">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                      stepInfo.status === "complete"
                        ? "bg-blue-600 text-white dark:bg-blue-500"
                        : stepInfo.status === "current"
                          ? "border-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                          : "border-2 border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {stepInfo.status === "complete" ? (
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
                  <div className={`${stepIdx !== stepsInfo.length - 1 ? "ml-4 w-full" : ""}`}>
                    <div
                      className={`${
                        stepIdx !== stepsInfo.length - 1
                          ? "h-0.5 w-full bg-slate-200 dark:bg-slate-700"
                          : ""
                      }`}
                    />
                  </div>
                </div>
                <div className="mt-2 text-center text-xs">
                  <p
                    className={`${
                      stepInfo.status === "complete"
                        ? "text-blue-600 dark:text-blue-400"
                        : stepInfo.status === "current"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-500 dark:text-slate-400"
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
