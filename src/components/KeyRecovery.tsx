import { useState } from "react";
import Card from "./Card";
import Button from "./Button";
import Input from "./Input";
import { useShares } from "../context/SharesContext";
import { combineShares } from "../utils/shamir";
import { toast } from "react-hot-toast";

interface ShareInput {
  id: number;
  shareString: string;
}

const KeyRecovery = () => {
  const { userShares, isLoading: sharesLoading } = useShares();
  const [shareInputs, setShareInputs] = useState<ShareInput[]>([{ id: 1, shareString: "" }]);
  const [recoveredSecret, setRecoveredSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Display a loading state when either local loading or shares loading is active
  const showLoading = isLoading || sharesLoading;

  // Add a new share input field
  const addShareInput = () => {
    const newId = shareInputs.length > 0 ? Math.max(...shareInputs.map((s) => s.id)) + 1 : 1;
    setShareInputs([...shareInputs, { id: newId, shareString: "" }]);
  };

  // Remove a share input field
  const removeShareInput = (id: number) => {
    if (shareInputs.length > 1) {
      setShareInputs(shareInputs.filter((share) => share.id !== id));
    }
  };

  // Update a share input field
  const updateShareInput = (id: number, value: string) => {
    setShareInputs(
      shareInputs.map((share) => (share.id === id ? { ...share, shareString: value } : share)),
    );
  };

  // Select a user share
  const selectUserShare = (shareString: string, index: number) => {
    try {
      // Find or create a share input slot
      const availableSlot = shareInputs.find((s) => !s.shareString);

      if (availableSlot) {
        // Update existing empty slot
        updateShareInput(availableSlot.id, shareString);
      } else {
        // Add a new slot with this share
        const newId = shareInputs.length > 0 ? Math.max(...shareInputs.map((s) => s.id)) + 1 : 1;
        setShareInputs([...shareInputs, { id: newId, shareString: shareString }]);
      }
    } catch (error) {
      console.error("Failed to use share:", error);
      toast.error("Invalid share format");
    }
  };

  // Recover the secret from the shares
  const recoverSecret = async () => {
    // Filter out empty shares
    const nonEmptyShares = shareInputs.filter((s) => s.shareString.trim() !== "");

    if (nonEmptyShares.length < 2) {
      toast.error("You need at least 2 valid shares to recover the secret");
      return;
    }

    setIsLoading(true);

    try {
      // Use the share strings directly
      const formattedShares = nonEmptyShares.map((s) => s.shareString.trim());

      console.log("Attempting to recover with shares:", formattedShares.length);

      // Recover the secret
      const secret = await combineShares(formattedShares);
      console.log("Successfully recovered secret with these shares");

      setRecoveredSecret(secret);
      toast.success("Secret recovered successfully!");
    } catch (error) {
      console.error("Failed to recover secret:", error);
      toast.error("Failed to recover the secret. Please check your shares and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetRecovery = () => {
    setShareInputs([{ id: 1, shareString: "" }]);
    setRecoveredSecret("");
  };

  // Content while loading
  if (showLoading) {
    return (
      <Card title="Recover Your Secret" className="max-w-lg">
        <div className="flex flex-col items-center justify-center py-10">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading your shares...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Recover Your Secret" className="max-w-lg">
      <div className="space-y-6">
        {/* User's saved shares (if any) */}
        {userShares && userShares.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-slate-800 dark:text-slate-200">Your Saved Shares</h3>
            <div className="flex flex-wrap gap-2">
              {userShares.map((share, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  onClick={() => selectUserShare(share, index)}
                >
                  Share #{index + 1}
                </Button>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click on a share to add it to the recovery form
            </p>
          </div>
        )}

        {/* Manual share input */}
        <div className="space-y-3">
          <h3 className="font-medium text-slate-800 dark:text-slate-200">Enter Shares Manually</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your Base64-encoded share values
          </p>
          {shareInputs.map((share) => (
            <div key={share.id} className="flex items-center space-x-2">
              <div className="flex-1">
                <Input
                  label={share.id === 1 ? "Share Value" : ""}
                  placeholder="Enter share value"
                  value={share.shareString}
                  onChange={(e) => updateShareInput(share.id, e.target.value)}
                  fullWidth
                />
              </div>
              <div className="flex h-full items-end pb-1">
                <button
                  type="button"
                  onClick={() => removeShareInput(share.id)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  disabled={shareInputs.length === 1}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addShareInput}>
            + Add Another Share
          </Button>
        </div>

        {/* Recovery button */}
        <div className="flex space-x-3">
          <Button onClick={recoverSecret} isLoading={isLoading} fullWidth>
            Recover Secret
          </Button>
        </div>

        {/* Debug section - only visible in development */}
        {process.env.NODE_ENV === "development" && userShares && userShares.length >= 2 && (
          <div className="mt-4 border-t border-dashed border-slate-300 pt-4 dark:border-slate-600">
            <h3 className="mb-2 font-medium text-slate-800 dark:text-slate-200">Debug Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              {userShares.length >= 2 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Test recovery with shares 1 & 2
                    setShareInputs([
                      { id: 1, shareString: userShares[0] },
                      { id: 2, shareString: userShares[1] },
                    ]);
                    console.log("Added shares 1 & 2 for testing");
                  }}
                >
                  Test Shares 1 & 2
                </Button>
              )}
              {userShares.length >= 3 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Test recovery with shares 2 & 3
                    setShareInputs([
                      { id: 1, shareString: userShares[1] },
                      { id: 2, shareString: userShares[2] },
                    ]);
                    console.log("Added shares 2 & 3 for testing");
                  }}
                >
                  Test Shares 2 & 3
                </Button>
              )}
              {userShares.length >= 3 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Test recovery with shares 1 & 3
                    setShareInputs([
                      { id: 1, shareString: userShares[0] },
                      { id: 2, shareString: userShares[2] },
                    ]);
                    console.log("Added shares 1 & 3 for testing");
                  }}
                >
                  Test Shares 1 & 3
                </Button>
              )}
              {userShares.length >= 2 && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    // Test all possible combinations
                    setIsLoading(true);
                    try {
                      toast.success("Testing all possible combinations...");
                      console.log("Testing all combinations of shares:");

                      // Generate all possible combinations of 2 or more shares
                      for (let size = 2; size <= userShares.length; size++) {
                        console.log(`Testing combinations of ${size} shares:`);

                        // Helper function to generate combinations
                        const generateCombinations = (
                          arr: any[],
                          size: number,
                          start = 0,
                          current: any[] = [],
                        ): void => {
                          if (current.length === size) {
                            // Test this combination
                            const combo = current;
                            console.log(`Testing combination of ${combo.length} shares`);

                            combineShares(combo)
                              .then((secret) =>
                                console.log(
                                  `✅ Successfully recovered secret with ${combo.length} shares`,
                                ),
                              )
                              .catch((err) =>
                                console.error(
                                  `❌ Failed to recover with ${combo.length} shares:`,
                                  err,
                                ),
                              );

                            return;
                          }

                          for (let i = start; i < arr.length; i++) {
                            generateCombinations(arr, size, i + 1, [...current, arr[i]]);
                          }
                        };

                        generateCombinations(userShares, size);
                      }

                      toast.success("Combination testing completed. Check console for results.");
                    } catch (error) {
                      console.error("Error testing combinations:", error);
                      toast.error("Failed to test combinations");
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  Test All Combinations
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Recovered secret */}
        {recoveredSecret && (
          <div className="space-y-4 rounded-md bg-green-50 p-4 dark:bg-green-900/20">
            <div>
              <h3 className="font-medium text-green-800 dark:text-green-300">
                Secret Recovered Successfully!
              </h3>
              <div className="mt-2">
                <div className="mb-1 text-sm font-medium text-green-700 dark:text-green-200">
                  Your Secret:
                </div>
                <div className="break-all rounded bg-white p-2 font-mono text-xs dark:bg-slate-800">
                  {recoveredSecret}
                </div>
              </div>
            </div>
            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={resetRecovery}>
                Start Over
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default KeyRecovery;
