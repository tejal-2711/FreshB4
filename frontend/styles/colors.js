/**
 * FreshB4 Design System - Colors and Design Tokens
 * Clean, aesthetic color palette with food freshness indicators
 */

export const colors = {
  // Primary brand colors
  primary: "#4CAF50", // Fresh green
  primaryLight: "#81C784", // Light green
  primaryDark: "#388E3C", // Dark green

  // Freshness status colors
  fresh: "#4CAF50", // Green - safe to eat
  ripe: "#FFC107", // Yellow - peak condition
  overripe: "#FF9800", // Orange - use soon
  spoiled: "#F44336", // Red - discard

  // Background colors
  background: "#F8F9FA", // Light gray background
  surface: "#FFFFFF", // White cards/surfaces
  surfaceLight: "#FAFAFA", // Very light surfaces

  // Text colors
  textPrimary: "#212121", // Dark text
  textSecondary: "#757575", // Medium gray text
  textHint: "#BDBDBD", // Light gray hints
  textInverse: "#FFFFFF", // White text on dark backgrounds

  // Border and divider colors
  border: "#E0E0E0", // Standard borders
  borderLight: "#F0F0F0", // Light borders

  // Status background colors (lighter versions)
  freshBg: "#E8F5E8", // Light green background
  ripeBg: "#FFFDE7", // Light yellow background
  overripeBg: "#FFF3E0", // Light orange background
  spoiledBg: "#FFEBEE", // Light red background

  // Notification and alert colors
  warning: "#FF9800", // Orange warnings
  error: "#F44336", // Red errors
  success: "#4CAF50", // Green success
  info: "#2196F3", // Blue info
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

export const shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  h2: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.textSecondary,
  },
  small: {
    fontSize: 12,
    fontWeight: "400",
    color: colors.textHint,
  },
};
