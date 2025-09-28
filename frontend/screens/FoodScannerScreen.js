/**
 * FoodScannerScreen - AI-Powered Food Analysis
 * Allows users to capture/select photos and get AI freshness analysis
 */

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { geminiService } from "../services/geminiService";
import { pantryService } from "../services/pantryService";
import {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
} from "../styles/colors";

export default function FoodScannerScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const cameraRef = useRef(null);
  const navigation = useNavigation();

  // Request camera permissions on mount and list available models
  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");

      // Debug: List available Gemini models
      try {
        console.log("Checking available Gemini models...");
        await geminiService.listAvailableModels();
      } catch (error) {
        console.log("Could not list models:", error);
      }
    })();
  }, []);

  /**
   * Take a picture with the camera
   */
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        setCapturedImage(photo.uri);
        setShowCamera(false);
        await analyzeImage(photo.base64);
      } catch (error) {
        Alert.alert("Error", "Failed to take picture");
      }
    }
  };

  /**
   * Pick image from gallery
   */
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant photo library access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);
      await analyzeImage(result.assets[0].base64);
    }
  };

  /**
   * Analyze captured image
   */
  const analyzeImage = async (base64Image) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await geminiService.analyzeFood(base64Image);
      setAnalysisResult(result);
    } catch (error) {
      Alert.alert(
        "Analysis Error",
        "Failed to analyze the image. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Reset the scanner
   */
  const resetScanner = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setShowCamera(false);
  };

  /**
   * Add analyzed item to Firebase pantry
   */
  const addToPantry = async () => {
    if (!analysisResult) return;

    try {
      // Calculate expiry date based on AI analysis
      const daysLeft =
        analysisResult.days_left !== undefined &&
        analysisResult.days_left !== null
          ? analysisResult.days_left
          : 7;
      const expiryDate = new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000);

      // If AI says it's spoiled (days_left <= 0), set expiry date to past
      if (daysLeft <= 0) {
        expiryDate.setTime(
          Date.now() - Math.abs(daysLeft) * 24 * 60 * 60 * 1000
        );
      }

      const pantryItem = {
        name: analysisResult.food_type || "Unknown Food",
        category: analysisResult.category || "Other",
        days_left: daysLeft,
        expiryDate: expiryDate,
        notes: analysisResult.recommendation || "",
        aiAnalysis: analysisResult,
        imageUrl: capturedImage || null,
      };

      console.log("Adding item to pantry:", {
        name: pantryItem.name,
        days_left: pantryItem.days_left,
        expiryDate: pantryItem.expiryDate,
        freshness: analysisResult.freshness,
        originalAIDaysLeft: analysisResult.days_left,
      });

      await pantryService.addItem(pantryItem);

      Alert.alert(
        "Added to Pantry!",
        `${pantryItem.name} has been added to your pantry.`,
        [
          {
            text: "Scan Another",
            onPress: resetScanner,
          },
          {
            text: "View Pantry",
            onPress: () => {
              resetScanner();
              navigation.navigate("Pantry");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error adding to pantry:", error);
      Alert.alert("Error", "Failed to add item to pantry. Please try again.");
    }
  };

  /**
   * Get status styling for analysis results
   */
  const getResultStyling = (freshness) => {
    switch (freshness) {
      case "fresh":
        return {
          color: colors.fresh,
          backgroundColor: colors.freshBg,
          icon: "checkmark-circle",
        };
      case "ripe":
        return {
          color: colors.ripe,
          backgroundColor: colors.ripeBg,
          icon: "alert-circle",
        };
      case "overripe":
        return {
          color: colors.overripe,
          backgroundColor: colors.overripeBg,
          icon: "time",
        };
      case "spoiled":
        return {
          color: colors.spoiled,
          backgroundColor: colors.spoiledBg,
          icon: "warning",
        };
      default:
        return {
          color: colors.textSecondary,
          backgroundColor: colors.surfaceLight,
          icon: "help-circle",
        };
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.container}>
        <Camera style={styles.camera} ref={cameraRef} ratio="4:3" />
        <View style={styles.cameraControls}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowCamera(false)}
          >
            <Ionicons name="close" size={24} color={colors.surface} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <View style={styles.placeholder} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Food Scanner</Text>
        <Text style={styles.subtitle}>
          Take a photo or select from gallery to analyze food freshness
        </Text>

        {/* API Status Indicator */}
        <View style={styles.apiStatus}>
          <View
            style={[
              styles.apiIndicator,
              {
                backgroundColor: geminiService.isConfigured
                  ? colors.success
                  : colors.warning,
              },
            ]}
          />
          <Text style={styles.apiStatusText}>
            {geminiService.isConfigured
              ? "AI Analysis Active"
              : "Demo Mode (Mock Data)"}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      {!capturedImage && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cameraButton]}
            onPress={() => setShowCamera(true)}
          >
            <Ionicons name="camera" size={32} color={colors.surface} />
            <Text style={styles.actionButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.galleryButton]}
            onPress={pickImage}
          >
            <Ionicons name="images" size={32} color={colors.surface} />
            <Text style={styles.actionButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Captured Image Preview */}
      {capturedImage && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          <TouchableOpacity style={styles.retakeButton} onPress={resetScanner}>
            <Ionicons name="camera" size={20} color={colors.primary} />
            <Text style={styles.retakeButtonText}>Retake Photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Analysis Loading */}
      {isAnalyzing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Analyzing food freshness...</Text>
        </View>
      )}

      {/* Analysis Results */}
      {analysisResult && !isAnalyzing && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Analysis Results</Text>

          {/* Main Status Card */}
          <View
            style={[
              styles.statusCard,
              {
                backgroundColor: getResultStyling(analysisResult.freshness)
                  .backgroundColor,
              },
            ]}
          >
            <View style={styles.statusHeader}>
              <Ionicons
                name={getResultStyling(analysisResult.freshness).icon}
                size={32}
                color={getResultStyling(analysisResult.freshness).color}
              />
              <View style={styles.statusInfo}>
                <Text
                  style={[
                    styles.freshnessStatus,
                    { color: getResultStyling(analysisResult.freshness).color },
                  ]}
                >
                  {analysisResult.freshness.toUpperCase()}
                </Text>
                <Text style={styles.foodType}>{analysisResult.food_type}</Text>
              </View>
              <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceLabel}>Confidence</Text>
                <Text style={styles.confidenceValue}>
                  {analysisResult.confidence}%
                </Text>
              </View>
            </View>
          </View>

          {/* Safety Status */}
          <View style={styles.safetyCard}>
            <View style={styles.safetyHeader}>
              <Ionicons
                name={
                  analysisResult.safe_to_consume ? "shield-checkmark" : "shield"
                }
                size={24}
                color={
                  analysisResult.safe_to_consume ? colors.success : colors.error
                }
              />
              <Text
                style={[
                  styles.safetyText,
                  {
                    color: analysisResult.safe_to_consume
                      ? colors.success
                      : colors.error,
                  },
                ]}
              >
                {analysisResult.safe_to_consume
                  ? "Safe to Consume"
                  : "NOT Safe - Discard"}
              </Text>
            </View>

            {analysisResult.days_left !== undefined && (
              <Text style={styles.daysLeft}>
                Estimated shelf life: {analysisResult.days_left} day(s)
              </Text>
            )}
          </View>

          {/* Recommendation */}
          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationTitle}>Recommendation</Text>
            <Text style={styles.recommendationText}>
              {analysisResult.recommendation}
            </Text>

            {analysisResult.storage_tip && (
              <>
                <Text style={styles.storageTipTitle}>Storage Tip</Text>
                <Text style={styles.storageTipText}>
                  {analysisResult.storage_tip}
                </Text>
              </>
            )}
          </View>

          {/* Detailed Analysis */}
          {analysisResult.details && (
            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>Analysis Details</Text>
              <Text style={styles.detailsText}>{analysisResult.details}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.addToPantryButton}
              onPress={addToPantry}
            >
              <Ionicons name="add-circle-outline" size={20} color="white" />
              <Text style={styles.addToPantryText}>Add to Pantry</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.scanAgainButton}
              onPress={resetScanner}
            >
              <Ionicons
                name="camera-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.scanAgainText}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
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
  apiStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
  },
  apiIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  apiStatusText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  actionButtons: {
    paddingHorizontal: spacing.md,
    flexDirection: "column",
    gap: spacing.md,
  },
  actionButton: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  cameraButton: {
    backgroundColor: colors.primary,
  },
  galleryButton: {
    backgroundColor: colors.info,
  },
  actionButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: "600",
    marginTop: spacing.sm,
  },
  imageContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: 300,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.small,
  },
  retakeButtonText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  resultsContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  resultsTitle: {
    ...typography.h2,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  statusCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  freshnessStatus: {
    ...typography.h3,
    fontWeight: "bold",
  },
  foodType: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  confidenceContainer: {
    alignItems: "center",
  },
  confidenceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  confidenceValue: {
    ...typography.h3,
    fontWeight: "bold",
    marginTop: spacing.xs / 2,
  },
  safetyCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  safetyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  safetyText: {
    ...typography.body,
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
  daysLeft: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  recommendationCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  recommendationTitle: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  recommendationText: {
    ...typography.body,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  storageTipTitle: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  storageTipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  detailsCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  detailsTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  detailsText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
  },
  cancelButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
  },
  placeholder: {
    width: 50,
    height: 50,
  },
//   actionButtons: {
//     flexDirection: "row",
//     marginTop: spacing.lg,
//     gap: spacing.md,
//   },
  addToPantryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  addToPantryText: {
    ...typography.body,
    color: "white",
    fontWeight: "600",
  },
  scanAgainButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  scanAgainText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
});
