import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: [],
  reducers: {
    addFavorite: (state, action) => {
      const existingRepo = state.find(item => item.id === action.payload.id);
      if (!existingRepo) {
        state.push(action.payload);
        AsyncStorage.setItem('favorites', JSON.stringify(state)); // Save updated favorites
      }
    },
    removeFavorite: (state, action) => {
      const updatedState = state.filter(item => item.id !== action.payload.id);
      AsyncStorage.setItem('favorites', JSON.stringify(updatedState)); // Save updated favorites
      return updatedState;
    },
    setFavorites: (state, action) => action.payload // Initialize favorites from AsyncStorage
  },
});

export const { addFavorite, removeFavorite, setFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
