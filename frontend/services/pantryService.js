/**
 * PantryService - Firebase integration for pantry management
 * Simple shared database for hackathon demo
 */

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

class PantryService {
  constructor() {
    this.collectionName = "pantryItems";
    this.listeners = [];
  }

  /**
   * Get all pantry items (real-time)
   * @param {Function} callback - Called when data changes
   * @returns {Function} Unsubscribe function
   */
  subscribeToItems(callback) {
    const q = query(
      collection(db, this.collectionName),
      orderBy("addedDate", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            ...data,
            // Convert Firestore timestamps to dates
            addedDate: data.addedDate?.toDate() || new Date(),
            expiryDate: data.expiryDate?.toDate() || new Date(),
          });
        });
        callback(items);
      },
      (error) => {
        console.error("Error fetching pantry items:", error);
        callback([]);
      }
    );

    return unsubscribe;
  }

  /**
   * Add new item to pantry
   * @param {Object} item - Item data
   * @returns {Promise<string>} Document ID
   */
  async addItem(item) {
    try {
      const itemData = {
        name: item.name,
        category: item.category || "Other",
        days_left:
          item.days_left !== undefined && item.days_left !== null
            ? item.days_left
            : 7,
        notes: item.notes || "",
        aiAnalysis: item.aiAnalysis || null,
        imageUrl: item.imageUrl || null,
        addedDate: serverTimestamp(),
        expiryDate:
          item.expiryDate ||
          new Date(
            Date.now() +
              (item.days_left !== undefined && item.days_left !== null
                ? item.days_left
                : 7) *
                24 *
                60 *
                60 *
                1000
          ),
      };

      const docRef = await addDoc(
        collection(db, this.collectionName),
        itemData
      );
      console.log(
        "Added item to pantry:",
        docRef.id,
        "with days_left:",
        itemData.days_left
      );
      return docRef.id;
    } catch (error) {
      console.error("Error adding item to pantry:", error);
      throw error;
    }
  }

  /**
   * Update existing item
   * @param {string} itemId - Document ID
   * @param {Object} updates - Updates to apply
   */
  async updateItem(itemId, updates) {
    try {
      const docRef = doc(db, this.collectionName, itemId);
      await updateDoc(docRef, {
        ...updates,
        updatedDate: serverTimestamp(),
      });
      console.log("Updated item:", itemId);
    } catch (error) {
      console.error("Error updating item:", error);
      throw error;
    }
  }

  /**
   * Delete item from pantry
   * @param {string} itemId - Document ID
   */
  async deleteItem(itemId) {
    try {
      const docRef = doc(db, this.collectionName, itemId);
      await deleteDoc(docRef);
      console.log("Deleted item:", itemId);
    } catch (error) {
      console.error("Error deleting item:", error);
      throw error;
    }
  }

  /**
   * Calculate freshness level based on days left
   * @param {number} daysLeft - Days until expiry
   * @returns {string} Freshness level
   */
  getFreshnessLevel(daysLeft) {
    console.log(`Firebase: ${daysLeft}`);
    if (daysLeft <= 0) return "spoiled";
    if (daysLeft <= 1) return "urgent";
    if (daysLeft <= 3) return "soon";
    return "fresh";
  }

  /**
   * Seed initial data for demo (call once)
   */
  async seedDemoData() {
    try {
      const demoItems = [
        {
          name: "Bananas",
          category: "Fruits",
          days_left: 1,
          notes: "Getting brown spots - perfect for smoothies or baking",
          aiAnalysis: {
            freshness: "ripe",
            confidence: 85,
            recommendation: "Use soon, great for baking",
          },
        },
        {
          name: "Spinach",
          category: "Vegetables",
          days_left: 2,
          notes: "Still crisp but use soon",
          aiAnalysis: {
            freshness: "fresh",
            confidence: 90,
            recommendation: "Perfect for salads",
          },
        },
        {
          name: "Chicken Breast",
          category: "Meat",
          days_left: 3,
          notes: "Stored in refrigerator",
          aiAnalysis: {
            freshness: "fresh",
            confidence: 95,
            recommendation: "Cook within 3 days",
          },
        },
        {
          name: "Bread",
          category: "Bakery",
          days_left: 5,
          notes: "Whole grain bread",
          aiAnalysis: {
            freshness: "fresh",
            confidence: 88,
            recommendation: "Store in cool, dry place",
          },
        },
      ];

      console.log("Seeding demo data...");
      for (const item of demoItems) {
        await this.addItem(item);
      }
      console.log("Demo data seeded successfully!");
    } catch (error) {
      console.error("Error seeding demo data:", error);
    }
  }
}

export const pantryService = new PantryService();
export default pantryService;
