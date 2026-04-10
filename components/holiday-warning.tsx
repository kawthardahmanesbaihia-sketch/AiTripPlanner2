'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { getHolidaysInTravelRange } from '@/lib/holiday-utils';
import type { Holiday } from '@/lib/holiday-utils';

interface HolidayWarningProps {
  countryCode?: string;
  countryName?: string;
  startDate?: Date;
  endDate?: Date;
}

export function HolidayWarning({
  countryCode,
  countryName,
  startDate,
  endDate,
}: HolidayWarningProps) {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkHolidays = async () => {
      if (!countryCode || !startDate || !endDate) {
        setHolidays([]);
        return;
      }

      setIsLoading(true);
      try {
        const overlappingHolidays = await getHolidaysInTravelRange(
          countryCode,
          startDate,
          endDate
        );
        setHolidays(overlappingHolidays);
      } catch (error) {
        console.error('[v0] Error checking holidays:', error);
        setHolidays([]);
      } finally {
        setIsLoading(false);
      }
    };

    checkHolidays();
  }, [countryCode, startDate, endDate]);

  // Don't render if no holidays found or missing required props
  if (holidays.length === 0 || isLoading) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
      >
        <Alert className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-200">
            Holiday Overlap
          </AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            <p className="mb-2">
              Your trip to {countryName} overlaps with {holidays.length} public holiday
              {holidays.length !== 1 ? 's' : ''}. This may affect prices, availability,
              and activities.
            </p>
            <ul className="list-inside list-disc space-y-1 ml-1">
              {holidays.map((holiday, index) => (
                <li key={index} className="text-sm">
                  {holiday.name} ({new Date(holiday.date).toLocaleDateString()})
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}
