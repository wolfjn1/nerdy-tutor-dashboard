'use client';

import { RateAdjustment } from '@/components/gamification';
import { DollarSign } from 'lucide-react';

export default function RatesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <DollarSign className="w-8 h-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Rate Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your hourly rate and adjustments
          </p>
        </div>
      </div>

      <RateAdjustment />
    </div>
  );
} 