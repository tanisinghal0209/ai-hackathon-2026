import { create } from 'zustand';

interface ProjectState {
  currentProjectId: string;
  selectedDocumentId: string | null;
  selectedActivityId: string | null;
  setCurrentProject: (id: string) => void;
  setSelectedDocument: (id: string | null) => void;
  setSelectedActivity: (id: string | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProjectId: 'alpha',
  selectedDocumentId: null,
  selectedActivityId: null,
  setCurrentProject: (id) => set({ currentProjectId: id }),
  setSelectedDocument: (id) => set({ selectedDocumentId: id }),
  setSelectedActivity: (id) => set({ selectedActivityId: id }),
}));

interface UIState {
  sidebarCollapsed: boolean;
  rightPanelOpen: boolean;
  theme: 'dark' | 'light';
  notifications: string[];
  toggleSidebar: () => void;
  toggleRightPanel: () => void;
  toggleTheme: () => void;
  addNotification: (msg: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  rightPanelOpen: false,
  theme: 'dark',
  notifications: [],
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  addNotification: (msg) => set((state) => ({ notifications: [...state.notifications, msg] })),
  clearNotifications: () => set({ notifications: [] }),
}));
