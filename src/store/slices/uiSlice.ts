import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  selectedTab: "visitor" | "subscriber";
  sidebarOpen: boolean;
  theme: "light" | "dark";
  notifications: Notification[];
  modals: {
    checkinModal: boolean;
    ticketModal: boolean;
    subscriptionModal: boolean;
  };
}

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  timestamp: number;
}

const initialState: UIState = {
  selectedTab: "visitor",
  sidebarOpen: false,
  theme: "light",
  notifications: [],
  modals: {
    checkinModal: false,
    ticketModal: false,
    subscriptionModal: false,
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSelectedTab: (
      state,
      action: PayloadAction<"visitor" | "subscriber">
    ) => {
      state.selectedTab = action.payload;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
    },
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, "id" | "timestamp">>
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setModal: (
      state,
      action: PayloadAction<{ modal: keyof UIState["modals"]; open: boolean }>
    ) => {
      state.modals[action.payload.modal] = action.payload.open;
    },
    closeAllModals: (state) => {
      state.modals = {
        checkinModal: false,
        ticketModal: false,
        subscriptionModal: false,
      };
    },
  },
});

export const {
  setSelectedTab,
  setSidebarOpen,
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
  setModal,
  closeAllModals,
} = uiSlice.actions;

export default uiSlice.reducer;
