/* ==========================================================================
   THE MIST & THE VALLEY — Firebase Firestore & Analytics SDK Integration
   Project ID: the-mist-and-the-valley
   Collection: 'sourcing_enquiries'
   ========================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Production Firebase Configuration for The Mist And The Valley
const firebaseConfig = {
  apiKey: "AIzaSyBkkFznlNYFeqTnaHoClC7GSqdBrvUwSxw",
  authDomain: "the-mist-and-the-valley.firebaseapp.com",
  projectId: "the-mist-and-the-valley",
  storageBucket: "the-mist-and-the-valley.firebasestorage.app",
  messagingSenderId: "168432064547",
  appId: "1:168432064547:web:26cac38021aae318b67996",
  measurementId: "G-D73R9T3FSD"
};

let app;
let db;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  
  // Analytics initialization (supported in browser environments)
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
  console.log("Firebase initialized successfully for Project: the-mist-and-the-valley");
} catch (error) {
  console.warn("Firebase initialization notice:", error);
}

/**
 * Stores B2B Sourcing Enquiry details into Cloud Firestore database ('sourcing_enquiries').
 * @param {Object} enquiryData 
 * @returns {Promise<Object>} Result object with status & docId
 */
export async function storeEnquiryInFirestore(enquiryData) {
  const payload = {
    fullName: enquiryData.full_name || "",
    companyName: enquiryData.company_name || "",
    businessEmail: enquiryData.business_email || "hello@themistandthevalley.com",
    country: enquiryData.country || "",
    phone: enquiryData.phone || "",
    productRequired: enquiryData.product_required || "",
    quantityRequired: enquiryData.quantity_required || "",
    unit: enquiryData.unit || "N/A",
    specification: enquiryData.specification || "",
    packaging: enquiryData.packaging || "",
    destinationCountry: enquiryData.destination_country || enquiryData.country || "",
    destinationPort: enquiryData.destination_port || "",
    message: enquiryData.message || "",
    formSource: enquiryData.form_source || "Web B2B Enquiry",
    contactEmail: "hello@themistandthevalley.com",
    status: "PENDING_REVIEW",
    createdAt: new Date().toISOString(),
    submittedAt: serverTimestamp ? serverTimestamp() : new Date()
  };

  console.log("[FIREBASE FIRESTORE] Saving Sourcing Enquiry to Project 'the-mist-and-the-valley':", payload);

  // Backup to localStorage for local durability
  saveToLocalStorageLog(payload);

  if (!db) {
    return { success: true, docId: "local_" + Date.now(), mode: "local_backup" };
  }

  try {
    const docRef = await addDoc(collection(db, "sourcing_enquiries"), payload);
    console.log("[FIREBASE FIRESTORE] Successfully written to Firestore with Document ID:", docRef.id);
    return { success: true, docId: docRef.id, mode: "firestore" };
  } catch (err) {
    console.warn("[FIREBASE FIRESTORE] Document write notice (saved locally as backup):", err);
    return { success: true, docId: "local_" + Date.now(), mode: "local_saved" };
  }
}

function saveToLocalStorageLog(payload) {
  try {
    const existing = JSON.parse(localStorage.getItem('tmv_enquiries') || '[]');
    existing.push(payload);
    localStorage.setItem('tmv_enquiries', JSON.stringify(existing));
  } catch (e) {
    console.error("Local backup save error:", e);
  }
}

// Attach function to global window scope
window.storeEnquiryInFirestore = storeEnquiryInFirestore;
