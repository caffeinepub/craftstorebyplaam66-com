import { create } from 'zustand';

interface FiltersState {
  searchText: string;
  selectedCategory: string | null;
  setSearchText: (text: string) => void;
  setSelectedCategory: (category: string | null) => void;
}

export const useFilters = create<FiltersState>((set) => ({
  searchText: '',
  selectedCategory: null,
  setSearchText: (text) => set({ searchText: text }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}));
