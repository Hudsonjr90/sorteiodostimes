import { useEffect, useState } from 'react';

interface DonationState {
  shouldShow: boolean;
  hasShownBefore: boolean;
}

const DONATION_STORAGE_KEY = 'sorteio.donation.v1';
const DAYS_BEFORE_PROMPT = 3;

interface DonationData {
  firstOpen: number;
  dismissedAt: number;
  usage_count: number;
}

export function useDonationPrompt(currentUsageCount: number): DonationState {
  const [shouldShow, setShouldShow] = useState(false);
  const [hasShownBefore, setHasShownBefore] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DONATION_STORAGE_KEY);
      const data: DonationData = raw
        ? JSON.parse(raw)
        : { firstOpen: Date.now(), dismissedAt: 0, usage_count: 0 };

      data.usage_count = Math.max(data.usage_count, currentUsageCount);
      localStorage.setItem(DONATION_STORAGE_KEY, JSON.stringify(data));

      const oneDayMs = 24 * 60 * 60 * 1000;
      const today = new Date().setHours(0, 0, 0, 0);
      const dismissedDate = new Date(data.dismissedAt).setHours(0, 0, 0, 0);

      if (dismissedDate === today) {
        setHasShownBefore(true);
        setShouldShow(false);
        return;
      }

      const daysSinceFirstOpen = Math.floor((Date.now() - data.firstOpen) / oneDayMs);
      const shouldPrompt =
        daysSinceFirstOpen >= DAYS_BEFORE_PROMPT ||
        data.usage_count >= 5;

      setShouldShow(shouldPrompt);
      setHasShownBefore(false);
    } catch {
      localStorage.removeItem(DONATION_STORAGE_KEY);
    }
  }, [currentUsageCount]);

  return { shouldShow, hasShownBefore };
}

export function dismissDonationPrompt() {
  try {
    const raw = localStorage.getItem(DONATION_STORAGE_KEY);
    const data: DonationData = raw ? JSON.parse(raw) : {};
    data.dismissedAt = Date.now();
    localStorage.setItem(DONATION_STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.error('Failed to dismiss donation prompt');
  }
}
