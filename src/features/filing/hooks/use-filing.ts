import { useState } from 'react';
import { TrackerItem } from '../types';

export const useFiling = () => {
  const [trackerItems, setTrackerItems] = useState<TrackerItem[]>([]);

  const addTrackerItem = (newItem: TrackerItem) => {
    setTrackerItems((prev) => [...prev, newItem]);
  };

  const updateTrackerItem = (id: string, updates: Partial<TrackerItem>) => {
    setTrackerItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeTrackerItem = (id: string) => {
    setTrackerItems((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    trackerItems,
    addTrackerItem,
    updateTrackerItem,
    removeTrackerItem,
  };
};
