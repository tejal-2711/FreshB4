/**
 * NotificationBanner Component
 * Displays alerts for expiring/spoiled items with action buttons
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
} from "../styles/colors";

export default function NotificationBanner({
  notificationData,
  onDismiss,
  onActionPress,
}) {
  const [fadeAnim] = React.useState(new Animated.Value(1));

  if (
    !notificationData ||
    (!notificationData.expired.count && !notificationData.expiring.count)
  ) {
    return null;
  }

  const handleDismiss = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDismiss && onDismiss();
    });
  };

  const handleActionPress = (action) => {
    onActionPress && onActionPress(action);
  };

  // Determine primary notification to show
  const primaryNotification =
    notificationData.expired.count > 0
      ? notificationData.expired
      : notificationData.expiring;

  const isExpired = notificationData.expired.count > 0;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Expired items banner (highest priority) */}
      {isExpired && (
        <View style={[styles.banner, styles.expiredBanner]}>
          <View style={styles.iconContainer}>
            <Ionicons name="warning" size={24} color={colors.spoiled} />
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.expiredTitle}>Items Spoiled!</Text>
            <Text style={styles.expiredMessage}>
              {notificationData.expired.message}
            </Text>
            <Text style={styles.itemsList}>
              {notificationData.expired.items
                .map((item) => item.name)
                .join(", ")}
            </Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.disposeButton]}
              onPress={() => handleActionPress("dispose")}
            >
              <Ionicons name="trash" size={16} color={colors.surface} />
              <Text style={styles.disposeButtonText}>Dispose</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dismissButton}
              onPress={handleDismiss}
            >
              <Ionicons name="close" size={20} color={colors.spoiled} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Expiring items banner */}
      {notificationData.expiring.count > 0 && (
        <View
          style={[
            styles.banner,
            styles.expiringBanner,
            isExpired && styles.secondaryBanner,
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="time" size={24} color={colors.overripe} />
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.expiringTitle}>Expiring Soon</Text>
            <Text style={styles.expiringMessage}>
              {notificationData.expiring.message}
            </Text>
            <Text style={styles.itemsList}>
              {notificationData.expiring.items
                .map((item) => item.name)
                .join(", ")}
            </Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.recipeButton]}
              onPress={() => handleActionPress("recipes")}
            >
              <Ionicons name="restaurant" size={16} color={colors.surface} />
              <Text style={styles.recipeButtonText}>Recipes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dismissButton}
              onPress={handleDismiss}
            >
              <Ionicons name="close" size={20} color={colors.overripe} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Health score indicator */}
      <View style={styles.healthScoreContainer}>
        <Ionicons
          name="pulse"
          size={16}
          color={
            notificationData.summary.healthScore > 70
              ? colors.fresh
              : colors.overripe
          }
        />
        <Text style={styles.healthScoreText}>
          Pantry Health: {notificationData.summary.healthScore}%
        </Text>
        <Text style={styles.summaryText}>
          {notificationData.summary.total} items total,{" "}
          {notificationData.summary.needsAttention} need attention
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.sm,
    marginVertical: spacing.sm,
  },
  banner: {
    flexDirection: "row",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.medium,
  },
  expiredBanner: {
    backgroundColor: colors.spoiledBg,
    borderLeftWidth: 4,
    borderLeftColor: colors.spoiled,
  },
  expiringBanner: {
    backgroundColor: colors.overripeBg,
    borderLeftWidth: 4,
    borderLeftColor: colors.overripe,
  },
  secondaryBanner: {
    opacity: 0.9,
  },
  iconContainer: {
    marginRight: spacing.md,
    justifyContent: "flex-start",
    paddingTop: spacing.xs,
  },
  contentContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  expiredTitle: {
    ...typography.h3,
    color: colors.spoiled,
    marginBottom: spacing.xs,
  },
  expiringTitle: {
    ...typography.h3,
    color: colors.overripe,
    marginBottom: spacing.xs,
  },
  expiredMessage: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  expiringMessage: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  itemsList: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  actionsContainer: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  disposeButton: {
    backgroundColor: colors.spoiled,
  },
  recipeButton: {
    backgroundColor: colors.overripe,
  },
  disposeButtonText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: "600",
    marginLeft: spacing.xs,
  },
  recipeButtonText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: "600",
    marginLeft: spacing.xs,
  },
  dismissButton: {
    padding: spacing.xs,
  },
  healthScoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  healthScoreText: {
    ...typography.caption,
    fontWeight: "600",
    marginLeft: spacing.xs,
    marginRight: spacing.sm,
  },
  summaryText: {
    ...typography.small,
    color: colors.textSecondary,
    flex: 1,
  },
});
