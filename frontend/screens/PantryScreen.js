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
} from "react-native";
import FoodCard from "../components/FoodCard";
import NotificationBanner from "../components/NotificationBanner";
import { notificationService } from "../services/notificationService";
import { colors, spacing, typography } from "../styles/colors";

export default function PantryScreen() {
  const [pantryItems, setPantryItems] = useState([]);
  const [notificationData, setNotificationData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Hardcoded pantry data with realistic items
  const hardcodedPantryItems = [
    {
      id: "1",
      name: "Bananas",
      category: "Fruits",
      days_left: 1,
      expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      addedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      notes: "Getting brown spots - perfect for smoothies or baking",
    },
    {
      id: "2",
      name: "Spinach",
      category: "Vegetables",
      days_left: 1,
      expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      addedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      notes: "Still crisp but use soon",
    },
    {
      id: "3",
      name: "Milk",
      category: "Dairy",
      days_left: 2,
      expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      addedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      notes: "Organic whole milk",
    },
    {
      id: "4",
      name: "Bread",
      category: "Bakery",
      days_left: 0,
      expiryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      addedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      notes: "Whole wheat - showing mold spots",
    },
    {
      id: "5",
      name: "Tomatoes",
      category: "Vegetables",
      days_left: 3,
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      addedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      notes: "Cherry tomatoes - nice and firm",
    },
    {
      id: "6",
      name: "Chicken Breast",
      category: "Meat",
      days_left: 2,
      expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      addedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      notes: "Organic free-range",
    },
    {
      id: "7",
      name: "Bell Peppers",
      category: "Vegetables",
      days_left: 4,
      expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      addedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      notes: "Red and yellow peppers",
    },
    {
      id: "8",
      name: "Greek Yogurt",
      category: "Dairy",
      days_left: 7,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      addedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      notes: "Plain, unsweetened",
    },
    {
      id: "9",
      name: "Carrots",
      category: "Vegetables",
      days_left: 10,
      expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      addedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      notes: "Baby carrots - still crunchy",
    },
    {
      id: "10",
      name: "Rice",
      category: "Grains",
      days_left: 365,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      addedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      notes: "Jasmine rice - pantry staple",
    },
  ];

  // Initialize pantry and notifications on mount
  useEffect(() => {
    loadPantryData();
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
   * Load pantry data (in real app, this would fetch from storage/API)
   */
  const loadPantryData = () => {
    setPantryItems(hardcodedPantryItems);
  };

  /**
   * Handle pull to refresh
   */
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadPantryData();
      setRefreshing(false);
    }, 1000);
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
            Tap items for more details. Visit the Recipes tab for meal
            suggestions!
          </Text>
          <FlatList
            data={pantryItems}
            renderItem={renderPantryItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
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
});
