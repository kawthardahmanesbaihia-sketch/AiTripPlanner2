/**
 * Holiday Warning System Utilities
 * Fetches public holidays from date.nager.at API and filters by date range
 */

export interface Holiday {
  date: string
  localName: string
  name: string
  countryCode: string
}

/**
 * Fetch public holidays for a specific country and year
 * @param year - Year (e.g., 2026)
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "FR", "US", "DZ")
 * @returns Array of holidays or empty array if fetch fails
 */
export async function getHolidays(
  year: number,
  countryCode: string
): Promise<Holiday[]> {
  try {
    const response = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode.toUpperCase()}`
    );

    if (!response.ok) {
      console.warn(
        `[v0] Holiday API returned status ${response.status} for ${countryCode}`
      );
      return [];
    }

    const holidays: Holiday[] = await response.json();
    return holidays;
  } catch (error) {
    console.warn(
      `[v0] Error fetching holidays for ${countryCode}:`,
      error
    );
    return [];
  }
}

/**
 * Filter holidays that fall within the travel date range
 * @param holidays - Array of holidays
 * @param startDate - Travel start date
 * @param endDate - Travel end date
 * @returns Array of holidays within the date range
 */
export function filterHolidaysInRange(
  holidays: Holiday[],
  startDate: Date,
  endDate: Date
): Holiday[] {
  return holidays.filter((holiday) => {
    const holidayDate = new Date(holiday.date);
    // Set time to midnight for accurate comparison
    holidayDate.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return holidayDate >= start && holidayDate <= end;
  });
}

/**
 * Get holidays that overlap with travel dates
 * @param countryCode - ISO country code
 * @param startDate - Travel start date
 * @param endDate - Travel end date
 * @returns Array of overlapping holidays
 */
export async function getHolidaysInTravelRange(
  countryCode: string,
  startDate: Date,
  endDate: Date
): Promise<Holiday[]> {
  const year = startDate.getFullYear();
  const holidays = await getHolidays(year, countryCode);
  return filterHolidaysInRange(holidays, startDate, endDate);
}
