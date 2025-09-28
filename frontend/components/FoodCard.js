/**
 * FoodCard Component
 * Displays individual pantry items with freshness status and color coding
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
} from "../styles/colors";

export default function FoodCard({ item, onPress }) {
  /**
   * Get status styling based on freshness level
   */
  const getStatusStyle = () => {
    const daysLeft = item.days_left;

    if (daysLeft <= 0) {
      return {
        color: colors.spoiled,
        backgroundColor: colors.spoiledBg,
        icon: "warning",
        text: "Spoiled",
        textColor: colors.spoiled,
      };
    } else if (daysLeft <= 1) {
      return {
        color: colors.overripe,
        backgroundColor: colors.overripeBg,
        icon: "time",
        text: "Use Today",
        textColor: colors.overripe,
      };
    } else if (daysLeft <= 3) {
      return {
        color: colors.ripe,
        backgroundColor: colors.ripeBg,
        icon: "alert-circle",
        text: `${daysLeft} days left`,
        textColor: colors.ripe,
      };
    } else {
      return {
        color: colors.fresh,
        backgroundColor: colors.freshBg,
        icon: "checkmark-circle",
        text: `${daysLeft} days left`,
        textColor: colors.fresh,
      };
    }
  };

  const statusStyle = getStatusStyle();

  /**
   * Format date for display
   */
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: statusStyle.color }]}
      onPress={() => onPress && onPress(item)}
      activeOpacity={0.7}
    >
      {/* Header with name and status icon */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.category}>{item.category}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusStyle.backgroundColor },
          ]}
        >
          <Ionicons
            name={statusStyle.icon}
            size={16}
            color={statusStyle.color}
          />
        </View>
      </View>

      {/* Status text and days left */}
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: statusStyle.textColor }]}>
          {statusStyle.text}
        </Text>
        {item.days_left > 0 && (
          <Text style={styles.expiryDate}>
            Expires {formatDate(item.expiryDate)}
          </Text>
        )}
      </View>

      {/* Additional info */}
      {item.notes && (
        <Text style={styles.notes} numberOfLines={2}>
          {item.notes}
        </Text>
      )}

      {/* Added date */}
      <Text style={styles.addedDate}>Added {formatDate(item.addedDate)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.xs,
    marginHorizontal: spacing.sm,
    borderLeftWidth: 4,
    ...shadows.medium,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  itemName: {
    ...typography.h3,
    marginBottom: spacing.xs / 2,
  },
  category: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.round,
    justifyContent: "center",
    alignItems: "center",
  },
  statusContainer: {
    marginBottom: spacing.sm,
  },
  statusText: {
    ...typography.body,
    fontWeight: "600",
    marginBottom: spacing.xs / 2,
  },
  expiryDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  notes: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: "italic",
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  addedDate: {
    ...typography.small,
    color: colors.textHint,
  },
});
