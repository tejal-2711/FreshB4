/**
 * RecipesScreen - AI-Powered Recipe Generation
 * Dedicated screen for generating and displaying recipes based on pantry items
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { geminiService } from "../services/geminiService";
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
} from "../styles/colors";

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState([]);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pantryItems, setPantryItems] = useState([]);

  // Hardcoded pantry data (same as PantryScreen for consistency)
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

  // Initialize pantry data on mount
  useEffect(() => {
    setPantryItems(hardcodedPantryItems);
  }, []);

  /**
   * Generate recipes based on pantry items
   */
  const generateRecipes = async () => {
    setIsGeneratingRecipes(true);
    try {
      const recipeData = await geminiService.getRecipes(pantryItems);
      setRecipes(recipeData.recipes || []);
    } catch (error) {
      console.error("Error generating recipes:", error);
    } finally {
      setIsGeneratingRecipes(false);
    }
  };

  /**
   * Handle pull to refresh
   */
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      generateRecipes();
      setRefreshing(false);
    }, 1000);
  };

  /**
   * Get ingredients summary for display
   */
  const getIngredientsSummary = () => {
    const urgentItems = pantryItems.filter((item) => item.days_left <= 2);
    const freshItems = pantryItems.filter((item) => item.days_left > 2);

    return {
      urgent: urgentItems.length,
      fresh: freshItems.length,
      total: pantryItems.length,
    };
  };

  /**
   * Render recipe card
   */
  const renderRecipeCard = (recipe) => (
    <View key={recipe.id} style={styles.recipeCard}>
      <View style={styles.recipeHeader}>
        <Text style={styles.recipeName}>{recipe.name}</Text>
        <View
          style={[
            styles.priorityBadge,
            {
              backgroundColor:
                recipe.priority === "high" ? colors.overripeBg : colors.freshBg,
            },
          ]}
        >
          <Text
            style={[
              styles.priorityText,
              {
                color:
                  recipe.priority === "high" ? colors.overripe : colors.fresh,
              },
            ]}
          >
            {recipe.priority === "high" ? "USE URGENT ITEMS" : "FRESH RECIPE"}
          </Text>
        </View>
      </View>

      <Text style={styles.recipeDescription}>{recipe.description}</Text>

      <View style={styles.recipeDetails}>
        <View style={styles.recipeDetailItem}>
          <Ionicons name="time" size={16} color={colors.textSecondary} />
          <Text style={styles.recipeDetailText}>{recipe.cookTime}</Text>
        </View>
        <View style={styles.recipeDetailItem}>
          <Ionicons name="bar-chart" size={16} color={colors.textSecondary} />
          <Text style={styles.recipeDetailText}>{recipe.difficulty}</Text>
        </View>
      </View>

      {recipe.ingredients.length > 0 && (
        <View style={styles.ingredientsContainer}>
          <Text style={styles.ingredientsTitle}>
            Ingredients from your pantry:
          </Text>
          <Text style={styles.ingredientsList}>
            {recipe.ingredients.join(", ")}
          </Text>
        </View>
      )}

      {recipe.instructions && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Instructions:</Text>
          {recipe.instructions.map((instruction, index) => (
            <Text key={index} style={styles.instructionStep}>
              {index + 1}. {instruction}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  const ingredientsSummary = getIngredientsSummary();

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
          <Text style={styles.title}>Recipe Generator</Text>
          <Text style={styles.subtitle}>
            AI-powered recipes using your pantry ingredients
          </Text>
        </View>

        {/* Pantry Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Ionicons name="alert-circle" size={24} color={colors.overripe} />
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryNumber}>
                  {ingredientsSummary.urgent}
                </Text>
                <Text style={styles.summaryLabel}>Urgent Items</Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.fresh}
              />
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryNumber}>
                  {ingredientsSummary.fresh}
                </Text>
                <Text style={styles.summaryLabel}>Fresh Items</Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Ionicons name="restaurant" size={24} color={colors.primary} />
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryNumber}>
                  {ingredientsSummary.total}
                </Text>
                <Text style={styles.summaryLabel}>Total Items</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Generate Recipes Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateRecipes}
            disabled={isGeneratingRecipes}
          >
            {isGeneratingRecipes ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <Ionicons name="sparkles" size={24} color={colors.surface} />
            )}
            <Text style={styles.generateButtonText}>
              {isGeneratingRecipes
                ? "Generating Recipes..."
                : "Generate New Recipes"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recipes Section */}
        {recipes.length > 0 && (
          <View style={styles.recipesSection}>
            <Text style={styles.sectionTitle}>Your Personalized Recipes</Text>
            <Text style={styles.sectionSubtitle}>
              Recipes prioritizing items that expire soon
            </Text>

            {recipes.map(renderRecipeCard)}
          </View>
        )}

        {/* Empty State */}
        {recipes.length === 0 && !isGeneratingRecipes && (
          <View style={styles.emptyState}>
            <Ionicons
              name="restaurant-outline"
              size={64}
              color={colors.textHint}
            />
            <Text style={styles.emptyStateTitle}>No Recipes Yet</Text>
            <Text style={styles.emptyStateText}>
              Tap "Generate New Recipes" to get AI-powered meal suggestions
              based on your pantry items.
            </Text>
          </View>
        )}
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
    lineHeight: 22,
  },
  summaryContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    ...shadows.medium,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryInfo: {
    alignItems: "center",
    marginTop: spacing.xs,
  },
  summaryNumber: {
    ...typography.h3,
    fontWeight: "bold",
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  actionContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  generateButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
  recipesSection: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  recipeCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  recipeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  recipeName: {
    ...typography.h3,
    flex: 1,
    marginRight: spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.md,
  },
  priorityText: {
    ...typography.small,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  recipeDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  recipeDetails: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  recipeDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.lg,
  },
  recipeDetailText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  ingredientsContainer: {
    backgroundColor: colors.surfaceLight,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  ingredientsTitle: {
    ...typography.caption,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  ingredientsList: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  instructionsContainer: {
    marginTop: spacing.sm,
  },
  instructionsTitle: {
    ...typography.body,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  instructionStep: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  emptyStateTitle: {
    ...typography.h3,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textHint,
    textAlign: "center",
    lineHeight: 22,
  },
});
