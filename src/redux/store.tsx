import { configureStore } from '@reduxjs/toolkit';
import repositoriesReducer from './repositoriesSlice';
import favoritesReducer from './favoritesSlice';

export default configureStore({
  reducer: {
    repositories: repositoriesReducer,
    favorites: favoritesReducer,
  },
});
