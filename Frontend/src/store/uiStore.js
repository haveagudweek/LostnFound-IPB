import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const createNotificationId = () => `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useUIStore = create(
  persist(
    (set, get) => ({
      toasts: [],
      notifications: [],
      confirmation: null,
      isLoading: false,
      setNotifications: (notifications) => set({ notifications }),
      addToast: (message, type = 'info') => {
        const id = createNotificationId();
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
        setTimeout(() => {
          set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, 3600);
      },
      addNotification: ({
        title,
        message,
        type = 'info',
        category = 'system',
        userId = null,
        link = null,
        showToast = true,
      }) => {
        const notification = {
          id: createNotificationId(),
          title,
          message,
          type,
          category,
          userId,
          link,
          read: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          notifications: [notification, ...state.notifications].slice(0, 80),
        }));

        if (showToast) {
          get().addToast(message, type);
        }

        return notification;
      },
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification
          ),
        })),
      markAllNotificationsRead: (userId) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            !notification.userId || notification.userId === userId
              ? { ...notification, read: true }
              : notification
          ),
        })),
      requestConfirmation: ({
        title = 'Konfirmasi Aksi',
        message = 'Apakah Anda yakin ingin melanjutkan?',
        confirmLabel = 'Konfirmasi',
        cancelLabel = 'Batalkan',
        tone = 'default',
      }) =>
        new Promise((resolve) => {
          set({
            confirmation: {
              title,
              message,
              confirmLabel,
              cancelLabel,
              tone,
              onConfirm: () => {
                set({ confirmation: null });
                resolve(true);
              },
              onCancel: () => {
                set({ confirmation: null });
                resolve(false);
              },
            },
          });
        }),
      removeToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'seekem-ui',
      partialize: (state) => ({}),
    }
  )
);
