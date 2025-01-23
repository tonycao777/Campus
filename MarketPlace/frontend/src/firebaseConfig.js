// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from 'firebase/storage'
import { getFirestore, collection, addDoc, getDocs, getDoc, query, where, deleteDoc, doc } from "firebase/firestore"; // Using addDoc to add users
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASEURL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App only if it hasn't been initialized yet
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);
const realtimeDB = getDatabase(app);

const storage = getStorage(app);

const userRef = collection(db, 'Users');
const itemRef = collection(db, 'Items');

export const fetchItems = async () => {
  const snapshot = await getDocs(itemRef);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

// Fetch items by campus
export const fetchItemsByCampus = async (campus) => {
  try {
    const q = query(itemRef, where("campus", "==", campus)); // Query for items where the campus field matches the selected campus
    const snapshot = await getDocs(q); // Get the query snapshot
    const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    return items; // Return the filtered items
  } catch (error) {
    console.error("Error fetching items by campus:", error);
    return [];
  }
};

// Add new item to Firestore
export const postItem = async (itemData) => {
  await addDoc(itemRef, { ...itemData, userId: auth.currentUser.uid });
};

// Delete an item by ID
export const deleteItem = async (itemId) => {
  await deleteDoc(doc(db, 'Items', itemId));
};

export const fetchItemById = async (itemId) => {
  const itemRef = doc(db, 'Items', itemId);
  const itemDoc = await getDoc(itemRef);
  if (itemDoc.exists()) {
    return itemDoc.data();
  } else {
    console.log("Item not found!");
    return null;
  }
};



// Fetching users from Firestore (just for demonstration, this would be in your app logic)
const fetchUsers = async () => {
  try {
    const snapshot = await getDocs(userRef);
    let users = [];
    snapshot.docs.forEach((doc) => {
      users.push({ ...doc.data(), id: doc.id });
    });
    console.log(users); // Log users to console (or update state)
  } catch (err) {
    console.log(err.message);
  }
};

// Fetching items from Firestore (just for demonstration, this would be in your app logic)
const consoleFetchItems = async () => {
  try {
    const snapshot = await getDocs(itemRef);
    let items = [];
    snapshot.docs.forEach((doc) => {
      items.push({ ...doc.data(), id: doc.id });
    });
    console.log(items); // Log users to console (or update state)
  } catch (err) {
    console.log(err.message);
  }
};

export const fetchUserFullName = async (userId) => {
  try {
    console.log(userId);
    const usersCollectionRef = collection(db, "Users"); // Reference the "Users" collection
    const q = query(usersCollectionRef, where("userId", "==", userId)); // Query for the document with matching userId

    const querySnapshot = await getDocs(q); // Fetch the query results

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]; // Assume only one match exists
      const { firstName, lastName } = userDoc.data();
      return `${firstName} ${lastName}`;
    } else {
      console.warn(`User with userId ${userId} not found.`);
      return "Unknown User";
    }
  } catch (error) {
    console.error("Error fetching user full name:", error);
    return "Unknown User";
  }
};


consoleFetchItems();

// Export for use in other components
export { auth, db, realtimeDB, fetchUsers, storage};