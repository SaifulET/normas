"use client";

import { create } from "zustand";
import type { PitchDetail } from "@/components/pitch/data";

type SavedListsState = {
  hydrated: boolean;
  items: PitchDetail[];
  savedIds: Record<string, boolean>;
  addSavedList: (item: PitchDetail) => void;
  removeSavedList: (listId: string) => void;
  setSavedLists: (items: PitchDetail[]) => void;
  setSavedState: (listId: string, saved: boolean, item?: PitchDetail) => void;
};

function getSavedIds(items: PitchDetail[]) {
  return items.reduce<Record<string, boolean>>((ids, item) => {
    ids[item.slug] = true;
    return ids;
  }, {});
}

export const useSavedListsStore = create<SavedListsState>()((set) => ({
  hydrated: false,
  items: [],
  savedIds: {},
  addSavedList: (item) =>
    set((state) => {
      if (state.savedIds[item.slug]) {
        return state;
      }

      const items = [item, ...state.items];
      return {
        items,
        savedIds: {
          ...state.savedIds,
          [item.slug]: true,
        },
      };
    }),
  removeSavedList: (listId) =>
    set((state) => {
      const savedIds = { ...state.savedIds };
      delete savedIds[listId];

      return {
        items: state.items.filter((item) => item.slug !== listId),
        savedIds,
      };
    }),
  setSavedLists: (items) =>
    set({
      hydrated: true,
      items,
      savedIds: getSavedIds(items),
    }),
  setSavedState: (listId, saved, item) =>
    set((state) => {
      if (!saved) {
        const savedIds = { ...state.savedIds };
        delete savedIds[listId];

        return {
          items: state.items.filter((currentItem) => currentItem.slug !== listId),
          savedIds,
        };
      }

      const nextItem = item ?? state.items.find((currentItem) => currentItem.slug === listId);

      return {
        items: nextItem && !state.savedIds[listId] ? [nextItem, ...state.items] : state.items,
        savedIds: {
          ...state.savedIds,
          [listId]: true,
        },
      };
    }),
}));
