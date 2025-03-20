import { useState } from "react";
import Card from "./Card";
import Button from "./Button";
import Input from "./Input";
import { useShares } from "../context/SharesContext";
import { combineShares, getAddressFromPrivateKey } from "../utils/shamir";
import { toast } from "react-hot-toast";

interface ShareInput {
  id: number;
  shareString: string;
}

const KeyRecovery = () => {
  const { userShares, isLoading: sharesLoading } = useShares();
  const [shareInputs, setShareInputs] = useState<ShareInput[]>([{ id: 1, shareString: "" }]);
  const [recoveredKey, setRecoveredKey] = useState("");
  const [recoveredAddress, setRecoveredAddress] = useState("");
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
  const selectUserShare = (shareString: string) => {
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

  // Parse and validate a share string
  const validateShareString = (shareString: string) => {
    try {
      // Try parsing as JSON
      const parsed = JSON.parse(shareString.trim());
      // Check if it has x and y properties
      if (parsed && typeof parsed.x === 'number' && typeof parsed.y === 'string') {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // Recover the private key from the shares
  const recoverKey = async () => {
    // Filter out empty shares
    const nonEmptyShares = shareInputs.filter((s) => s.shareString.trim() !== "");
    
    if (nonEmptyShares.length < 2) {
      toast.error("You need at least 2 valid shares to recover the key");
      return;
    }

    // Validate each share
    const validShares = nonEmptyShares.filter(s => validateShareString(s.shareString));
    
    if (validShares.length < 2) {
      toast.error("At least 2 valid share keys are required. Please check your format.");
      return;
    }

    setIsLoading(true);

    try {
      // Use the share strings directly
      const formattedShares = validShares.map(s => s.shareString.trim());
      
      console.log("Attempting to recover with shares:", formattedShares.map(s => {
        try {
          const parsed = JSON.parse(s);
          return { x: parsed.x, yPrefix: parsed.y.substring(0, 10) + "..." };
        } catch (e) {
          return "Invalid JSON";
        }
      }));

      // Recover the key
      const key = await combineShares(formattedShares);
      console.log("Successfully recovered key with these shares");

      // Get the address from the key
      const address = getAddressFromPrivateKey(key);

      setRecoveredKey(`0x${key}`);
      setRecoveredAddress(address);
      toast.success("Private key recovered successfully!");
    } catch (error) {
      console.error("Failed to recover key:", error);
      toast.error("Failed to recover the private key. Please check your shares and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetRecovery = () => {
    setShareInputs([{ id: 1, shareString: "" }]);
    setRecoveredKey("");
    setRecoveredAddress("");
  };

  // Content while loading
  if (showLoading) {
    return (
      <Card title="Recover Your Private Key" className="max-w-lg">
        <div className="flex flex-col items-center justify-center py-10">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading your shares...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Recover Your Private Key" className="max-w-lg">
      <div className="space-y-6">
        {/* User's saved shares (if any) */}
        {userShares && userShares.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-slate-800 dark:text-slate-200">Your Saved Shares</h3>
            <div className="flex flex-wrap gap-2">
              {userShares.map((share, index) => {
                try {
                  const parsedShare = JSON.parse(share);
                  return (
                    <Button
                      key={index}
                      size="sm"
                      variant="outline"
                      onClick={() => selectUserShare(share)}
                    >
                      Share #{parsedShare.x}
                    </Button>
                  );
                } catch (e) {
                  return null; // Skip invalid shares
                }
              })}
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
            Enter your share key in the format: {`{"x":1,"y":"12345..."}`}
          </p>
          {shareInputs.map((share) => (
            <div key={share.id} className="flex items-center space-x-2">
              <div className="flex-1">
                <Input
                  label={share.id === 1 ? "Share Key" : ""}
                  placeholder='{"x":1,"y":"12345..."}'
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
          <Button onClick={recoverKey} isLoading={isLoading} fullWidth>
            Recover Private Key
          </Button>
        </div>

        {/* Debug section - only visible in development */}
        {process.env.NODE_ENV === 'development' && userShares && userShares.length >= 2 && (
          <div className="border-t border-dashed border-slate-300 mt-4 pt-4 dark:border-slate-600">
            <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Debug Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              {userShares.length >= 2 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Test recovery with shares 1 & 2
                    try {
                      const share1 = JSON.parse(userShares[0]);
                      const share2 = JSON.parse(userShares[1]);
                      setShareInputs([
                        { id: 1, shareString: JSON.stringify(share1) }, 
                        { id: 2, shareString: JSON.stringify(share2) }
                      ]);
                      console.log("Added shares 1 & 2 for testing");
                    } catch (e) {
                      console.error("Failed to parse shares:", e);
                    }
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
                    try {
                      const share2 = JSON.parse(userShares[1]);
                      const share3 = JSON.parse(userShares[2]);
                      setShareInputs([
                        { id: 1, shareString: JSON.stringify(share2) }, 
                        { id: 2, shareString: JSON.stringify(share3) }
                      ]);
                      console.log("Added shares 2 & 3 for testing");
                    } catch (e) {
                      console.error("Failed to parse shares:", e);
                    }
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
                    try {
                      const share1 = JSON.parse(userShares[0]);
                      const share3 = JSON.parse(userShares[2]);
                      setShareInputs([
                        { id: 1, shareString: JSON.stringify(share1) }, 
                        { id: 2, shareString: JSON.stringify(share3) }
                      ]);
                      console.log("Added shares 1 & 3 for testing");
                    } catch (e) {
                      console.error("Failed to parse shares:", e);
                    }
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
                      
                      // Parse all shares
                      const parsedShares = userShares.map(s => {
                        try {
                          return JSON.parse(s);
                        } catch (e) {
                          console.error("Failed to parse share:", s);
                          return null;
                        }
                      }).filter(Boolean);
                      
                      console.log(`Found ${parsedShares.length} valid shares`);
                      
                      // Generate all possible combinations of 2 or more shares
                      for (let size = 2; size <= parsedShares.length; size++) {
                        console.log(`Testing combinations of ${size} shares:`);
                        
                        // Helper function to generate combinations
                        const generateCombinations = (arr: any[], size: number, start = 0, current: any[] = []): void => {
                          if (current.length === size) {
                            // Test this combination
                            const combo = current.map(item => JSON.stringify(item));
                            const shareIndexes = current.map(item => item.x);
                            console.log(`Testing combination: [${shareIndexes.join(', ')}]`);
                            
                            combineShares(combo)
                              .then(key => console.log(`✅ Successfully recovered with shares [${shareIndexes.join(', ')}]`))
                              .catch(err => console.error(`❌ Failed to recover with shares [${shareIndexes.join(', ')}]:`, err));
                            
                            return;
                          }
                          
                          for (let i = start; i < arr.length; i++) {
                            generateCombinations(arr, size, i + 1, [...current, arr[i]]);
                          }
                        };
                        
                        generateCombinations(parsedShares, size);
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

        {/* Recovered key & address */}
        {recoveredKey && (
          <div className="space-y-4 rounded-md bg-green-50 p-4 dark:bg-green-900/20">
            <div>
              <h3 className="font-medium text-green-800 dark:text-green-300">
                Key Recovered Successfully!
              </h3>
              <div className="mt-2">
                <div className="mb-1 text-sm font-medium text-green-700 dark:text-green-200">
                  Private Key:
                </div>
                <div className="break-all rounded bg-white p-2 font-mono text-xs dark:bg-slate-800">
                  {recoveredKey}
                </div>
              </div>
              <div className="mt-3">
                <div className="mb-1 text-sm font-medium text-green-700 dark:text-green-200">
                  Ethereum Address:
                </div>
                <div className="break-all rounded bg-white p-2 font-mono text-xs dark:bg-slate-800">
                  {recoveredAddress}
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
