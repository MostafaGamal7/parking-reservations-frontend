import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Zone } from "@/types";

interface ZonesState {
  zones: Zone[];
  selectedZone: Zone | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ZonesState = {
  zones: [],
  selectedZone: null,
  isLoading: false,
  error: null,
};

const zonesSlice = createSlice({
  name: "zones",
  initialState,
  reducers: {
    setZones: (state, action: PayloadAction<Zone[]>) => {
      state.zones = action.payload;
    },
    updateZone: (state, action: PayloadAction<Zone>) => {
      const index = state.zones.findIndex(
        (zone) => zone.id === action.payload.id
      );
      if (index !== -1) {
        state.zones[index] = action.payload;
      }
    },
    setSelectedZone: (state, action: PayloadAction<Zone | null>) => {
      state.selectedZone = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setZones,
  updateZone,
  setSelectedZone,
  setLoading,
  setError,
  clearError,
} = zonesSlice.actions;

export default zonesSlice.reducer;
