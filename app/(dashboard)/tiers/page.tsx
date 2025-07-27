'use client';

import { useEffect, useState } from 'react';
import { Card, Button } from '@/components/ui';
import { TierProgress } from '@/components/gamification/TierProgress';
import { Trophy, RefreshCw } from 'lucide-react';

export default function TiersPage() {
  const [tierCheckResult, setTierCheckResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkTier = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gamification/tier-check');
      const data = await response.json();
      setTierCheckResult(data);
    } catch (error) {
      console.error('Error checking tier:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkTier();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tier System
        </h1>
        <Button
          onClick={checkTier}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Check Tier
        </Button>
      </div>

      {/* Tier Progress Component */}
      <TierProgress />

      {/* Tier Check Results */}
      {tierCheckResult && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Tier Check Results
          </h2>
          
          <div className="space-y-3">
            {tierCheckResult.promoted ? (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-green-800 dark:text-green-200 font-medium">
                  🎉 Congratulations! You've been promoted!
                </p>
                <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                  From {tierCheckResult.previousTier} to {tierCheckResult.newTier} tier
                </p>
              </div>
            ) : (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200">
                  Current Tier: <span className="font-semibold capitalize">{tierCheckResult.currentTier}</span>
                </p>
              </div>
            )}

            {tierCheckResult.stats && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {tierCheckResult.stats.completedSessions}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sessions
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {tierCheckResult.stats.averageRating.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Rating
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {tierCheckResult.stats.retentionRate.toFixed(0)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Retention
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Tier Benefits Reference */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Tier Requirements & Benefits</h2>
        
        <div className="space-y-4">
          <div className="border-l-4 border-gray-400 pl-4">
            <h3 className="font-semibold">Standard Tier</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Starting tier for all tutors</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>• Access to basic platform features</li>
              <li>• Standard student matching</li>
            </ul>
          </div>

          <div className="border-l-4 border-gray-500 pl-4">
            <h3 className="font-semibold">Silver Tier</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              50+ sessions, 4.5+ rating, 80%+ retention
            </p>
            <ul className="text-sm mt-2 space-y-1">
              <li>• 5% base rate increase</li>
              <li>• Priority in search results</li>
              <li>• Silver badge on profile</li>
            </ul>
          </div>

          <div className="border-l-4 border-yellow-500 pl-4">
            <h3 className="font-semibold">Gold Tier</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              150+ sessions, 4.7+ rating, 85%+ retention
            </p>
            <ul className="text-sm mt-2 space-y-1">
              <li>• 10% base rate increase</li>
              <li>• Featured tutor badge</li>
              <li>• Priority student matching</li>
            </ul>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-semibold">Elite Tier</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              300+ sessions, 4.8+ rating, 90%+ retention
            </p>
            <ul className="text-sm mt-2 space-y-1">
              <li>• 15% base rate increase</li>
              <li>• Access to specialized program</li>
              <li>• Quarterly performance bonuses</li>
              <li>• Dedicated support team</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
} 