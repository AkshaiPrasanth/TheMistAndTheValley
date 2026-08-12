/* ==========================================================================
   THE MIST & THE VALLEY — Firebase Firestore Integration
   Project Name: TheMistandthevalleyExport
   Project ID: themistandthevalleyexport
   Project Number: 116366730464
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

// Production Firebase Configuration for Project 'themistandthevalleyexport'
const firebaseConfig = {
  apiKey: "AIzaSyBkkFznlNYFeqTnaHoClC7GSqdBrvUwSxw",
  authDomain: "themistandthevalleyexport.firebaseapp.com",
  projectId: "themistandthevalleyexport",
  storageBucket: "themistandthevalleyexport.firebasestorage.app",
  messagingSenderId: "116366730464",
  appId: "1:116366730464:web:26cac38021aae318b67996",
  measurementId: "G-D73R9T3FSD"
};

let app;
let db;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  
  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
    } catch (e) {
      console.log("Analytics notice:", e);
    }
  }
  console.log("🔥 Firebase initialized for Project: themistandthevalleyexport");
} catch (error) {
  console.error("🔥 Firebase initialization error:", error);
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
    registeredLocation: "Ooty, Tamil Nadu, India",
    status: "PENDING_REVIEW",
    createdAt: new Date().toISOString(),
    submittedAt: serverTimestamp ? serverTimestamp() : new Date()
  };

  console.log("🔥 [FIREBASE FIRESTORE] Saving to collection 'sourcing_enquiries':", payload);

  // Backup to localStorage for local durability
  saveToLocalStorageLog(payload);

  if (!db) {
    console.error("🔥 Firestore DB object is null.");
    return { success: false, mode: "no_db" };
  }

  try {
    const colRef = collection(db, "sourcing_enquiries");
    const docRef = await addDoc(colRef, payload);
    console.log("🔥 [FIREBASE SUCCESS] Document written to Firestore with ID:", docRef.id);
    return { success: true, docId: docRef.id, mode: "firestore" };
  } catch (err) {
    console.error("🔥 [FIREBASE ERROR] Could not write to Firestore database:", err);
    return { success: false, error: err.message, mode: "error" };
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
