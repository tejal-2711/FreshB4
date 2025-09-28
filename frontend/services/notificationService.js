/**
 * NotificationService - Expo Notifications Management
 * Handles local notifications for food expiry alerts
 */

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.notificationIds = new Set();
  }

  /**
   * Request notification permissions
   * @returns {boolean} Permission granted
   */
  async requestPermissions() {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("Failed to get push token for push notification!");
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("food-alerts", {
          name: "Food Expiry Alerts",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF9800",
        });
      }

      return true;
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  }

  /**
   * Schedule notifications for expiring items
   * @param {Array} pantryItems - Items to check for expiry
   */
  async scheduleExpiryNotifications(pantryItems) {
    try {
      // Clear existing notifications
      await this.clearAllNotifications();

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      // Find items that are expiring or expired
      const expiredItems = pantryItems.filter((item) => item.days_left <= 0);
      const expiringSoonItems = pantryItems.filter(
        (item) => item.days_left > 0 && item.days_left <= 3
      );

      // Schedule notifications for expired items
      if (expiredItems.length > 0) {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: "🚨 Spoiled Items Alert!",
            body: `${expiredItems.length} item(s) have spoiled: ${expiredItems
              .map((item) => item.name)
              .join(", ")}. Please dispose of them safely.`,
            data: {
              type: "expired",
              items: expiredItems,
            },
            categoryIdentifier: "food-expired",
          },
          trigger: null, // Show immediately
        });
        this.notificationIds.add(notificationId);
      }

      // Schedule notifications for expiring items
      if (expiringSoonItems.length > 0) {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: "⏰ Items Expiring Soon",
            body: `${
              expiringSoonItems.length
            } item(s) expire in 3 days or less: ${expiringSoonItems
              .map((item) => item.name)
              .join(", ")}. Use them soon!`,
            data: {
              type: "expiring",
              items: expiringSoonItems,
            },
            categoryIdentifier: "food-expiring",
          },
          trigger: {
            seconds: 5, // Show after 5 seconds
          },
        });
        this.notificationIds.add(notificationId);
      }

      // Schedule daily reminder if there are items to track
      if (pantryItems.length > 0) {
        const reminderNotificationId =
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "📱 FreshB4 Daily Check",
              body: "Check your pantry for items that might need attention today.",
              data: {
                type: "daily-reminder",
              },
              categoryIdentifier: "daily-reminder",
            },
            trigger: {
              hour: 9,
              minute: 0,
              repeats: true,
            },
          });
        this.notificationIds.add(reminderNotificationId);
      }
    } catch (error) {
      console.error("Error scheduling notifications:", error);
    }
  }

  /**
   * Get notification data for in-app banners
   * @param {Array} pantryItems - Items to analyze
   * @returns {Object} Notification data for UI
   */
  getNotificationData(pantryItems) {
    const expiredItems = pantryItems.filter((item) => item.days_left <= 0);
    const expiringSoonItems = pantryItems.filter(
      (item) => item.days_left > 0 && item.days_left <= 3
    );
    const freshItems = pantryItems.filter((item) => item.days_left > 3);

    return {
      expired: {
        count: expiredItems.length,
        items: expiredItems,
        message:
          expiredItems.length > 0
            ? `${expiredItems.length} item(s) have spoiled and should be discarded`
            : null,
        severity: "high",
      },
      expiring: {
        count: expiringSoonItems.length,
        items: expiringSoonItems,
        message:
          expiringSoonItems.length > 0
            ? `${expiringSoonItems.length} item(s) expire in 3 days or less`
            : null,
        severity: "medium",
      },
      fresh: {
        count: freshItems.length,
        items: freshItems,
      },
      summary: {
        total: pantryItems.length,
        needsAttention: expiredItems.length + expiringSoonItems.length,
        healthScore:
          pantryItems.length > 0
            ? Math.round((freshItems.length / pantryItems.length) * 100)
            : 100,
      },
    };
  }

  /**
   * Clear all scheduled notifications
   */
  async clearAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.notificationIds.clear();
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  }

  /**
   * Setup notification categories with action buttons
   */
  async setupNotificationCategories() {
    try {
      await Notifications.setNotificationCategoryAsync("food-expired", [
        {
          identifier: "dispose",
          buttonTitle: "Mark as Disposed",
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: "remind-later",
          buttonTitle: "Remind Later",
          options: {
            opensAppToForeground: false,
          },
        },
      ]);

      await Notifications.setNotificationCategoryAsync("food-expiring", [
        {
          identifier: "use-now",
          buttonTitle: "Get Recipes",
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: "remind-tomorrow",
          buttonTitle: "Remind Tomorrow",
          options: {
            opensAppToForeground: false,
          },
        },
      ]);
    } catch (error) {
      console.error("Error setting up notification categories:", error);
    }
  }
}

export const notificationService = new NotificationService();
