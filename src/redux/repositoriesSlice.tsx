import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const searchRepositories = createAsyncThunk(
  'repositories/searchRepositories',
  async (query) => {
    const response = await axios.get(`https://api.github.com/search/repositories?q=${query}`);
    return response.data.items;
  }
);

const repositoriesSlice = createSlice({
  name: 'repositories',
  initialState: { repositories: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(searchRepositories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchRepositories.fulfilled, (state, action) => {
        state.loading = false;
        state.repositories = action.payload;
      })
      .addCase(searchRepositories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default repositoriesSlice.reducer;
