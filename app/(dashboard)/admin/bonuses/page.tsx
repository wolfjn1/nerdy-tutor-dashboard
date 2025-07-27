'use client';

import { BonusManagement } from '@/components/admin/BonusManagement';
import { DollarSign } from 'lucide-react';

export default function AdminBonusesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <DollarSign className="w-8 h-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bonus Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and approve tutor bonuses
          </p>
        </div>
      </div>

      <BonusManagement />
    </div>
  );
} 