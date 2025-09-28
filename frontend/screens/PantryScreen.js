/**
 * PantryScreen - Pantry Management
 * Shows pantry items with freshness tracking and notifications
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import FoodCard from "../components/FoodCard";
import NotificationBanner from "../components/NotificationBanner";
import { notificationService } from "../services/notificationService";
import { pantryService } from "../services/pantryService";
import { colors, spacing, typography } from "../styles/colors";

export default function PantryScreen() {
  const [pantryItems, setPantryItems] = useState([]);
  const [notificationData, setNotificationData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize Firebase real-time listener on mount
  useEffect(() => {
    console.log("Setting up Firebase listener for pantry items...");
    setLoading(true);

    // Subscribe to real-time updates from Firebase
    const unsubscribe = pantryService.subscribeToItems((items) => {
      console.log("Received pantry items from Firebase:", items.length);

      // Calculate days_left for each item based on expiry date
      const itemsWithDaysLeft = items.map((item) => {
        const daysLeft = Math.ceil(
          (item.expiryDate - new Date()) / (1000 * 60 * 60 * 24)
        );

        // Log for debugging
        console.log(
          `Item ${item.name}: days_left=${daysLeft}, expiry=${item.expiryDate}`
        );

        return {
          ...item,
          days_left: daysLeft,
        };
      });

      setPantryItems(itemsWithDaysLeft);
      setLoading(false);
      setRefreshing(false);
    });

    // Cleanup listener on unmount
    return () => {
      console.log("Cleaning up Firebase listener");
      unsubscribe();
    };
  }, []);

  // Update notifications when pantry changes
  useEffect(() => {
    if (pantryItems.length > 0) {
      const notifications =
        notificationService.getNotificationData(pantryItems);
      setNotificationData(notifications);
      notificationService.scheduleExpiryNotifications(pantryItems);
    }
  }, [pantryItems]);

  /**
   * Handle pull to refresh
   */
  const onRefresh = () => {
    setRefreshing(true);
    // Firebase listener will automatically update the data
    // Just show the refresh indicator briefly
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  /**
   * Seed demo data if pantry is empty
   */
  const seedDemoData = async () => {
    try {
      console.log("Seeding demo data...");
      await pantryService.seedDemoData();
    } catch (error) {
      console.error("Error seeding demo data:", error);
    }
  };

  /**
   * Handle notification banner actions
   */
  const handleNotificationAction = (action) => {
    switch (action) {
      case "dispose":
        // In real app, would mark items as disposed
        console.log("Mark spoiled items as disposed");
        break;
      case "recipes":
        // Recipe generation is now handled by RecipesScreen
        console.log("Navigate to recipes tab for recipe generation");
        break;
      default:
        break;
    }
  };

  /**
   * Handle food card press
   */
  const handleFoodCardPress = (item) => {
    console.log("Food card pressed:", item.name);
    // In real app, could show detailed view or edit options
  };

  /**
   * Render individual pantry item
   */
  const renderPantryItem = ({ item }) => (
    <FoodCard item={item} onPress={handleFoodCardPress} />
  );

  /**
   * Get pantry statistics
   */
  const getPantryStats = () => {
    const urgent = pantryItems.filter((item) => item.days_left <= 1).length;
    const expiringSoon = pantryItems.filter(
      (item) => item.days_left > 1 && item.days_left <= 3
    ).length;
    const fresh = pantryItems.filter((item) => item.days_left > 3).length;

    return { urgent, expiringSoon, fresh, total: pantryItems.length };
  };

  const stats = getPantryStats();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Pantry</Text>
          <Text style={styles.subtitle}>
            {stats.total} items • Track freshness and reduce waste
          </Text>
        </View>

        {/* Pantry Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.urgent}</Text>
            <Text style={[styles.statLabel, { color: colors.spoiled }]}>
              Urgent
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.expiringSoon}</Text>
            <Text style={[styles.statLabel, { color: colors.overripe }]}>
              Soon
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.fresh}</Text>
            <Text style={[styles.statLabel, { color: colors.fresh }]}>
              Fresh
            </Text>
          </View>
        </View>

        {/* Notification Banner */}
        {notificationData && (
          <NotificationBanner
            notificationData={notificationData}
            onActionPress={handleNotificationAction}
            onDismiss={() => setNotificationData(null)}
          />
        )}

        {/* Pantry Items */}
        <View style={styles.pantrySection}>
          <Text style={styles.sectionTitle}>Pantry Items</Text>
          <Text style={styles.sectionSubtitle}>
            {loading
              ? "Loading pantry data from Firebase..."
              : pantryItems.length > 0
              ? "Tap items for more details. Visit the Recipes tab for meal suggestions!"
              : "Your pantry is empty. Scan some food to get started!"}
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Connecting to Firebase...</Text>
            </View>
          ) : pantryItems.length > 0 ? (
            <FlatList
              data={pantryItems}
              renderItem={renderPantryItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No items in pantry</Text>
              <Text style={styles.emptySubtitle}>
                Scan food with the camera or add some demo data to get started!
              </Text>
              <TouchableOpacity
                style={styles.seedButton}
                onPress={seedDemoData}
              >
                <Text style={styles.seedButtonText}>Add Demo Data</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    padding: spacing.lg,
    alignItems: "center",
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    justifyContent: "space-around",
  },
  statCard: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    ...typography.h2,
    fontWeight: "bold",
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    ...typography.caption,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  pantrySection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: "center",
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  seedButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 25,
  },
  seedButtonText: {
    ...typography.body,
    color: "white",
    fontWeight: "600",
  },
});
