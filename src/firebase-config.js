// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getFirestore, doc, setDoc, deleteDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const db = getFirestore(app);

export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });
    if (currentToken) {
      console.log('current token for client: ', currentToken);

      // Use the token as the document ID for efficiency and security
      // setDoc checks for existence or overwrites, which is fine here
      await setDoc(doc(db, "fcm_tokens", currentToken), {
        token: currentToken,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log("Token added/updated in Firestore");

      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
    return null;
  }
};

// Modified to accept a callback for continuous listening
export const onMessageListener = (callback) => {
    return onMessage(messaging, (payload) => {
      console.log("payload", payload);
      callback(payload);
    });
};

export const unsubscribeUser = async () => {
    try {
        const currentToken = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });
        if (currentToken) {
             // Directly delete the document using the token as ID
             await deleteDoc(doc(db, "fcm_tokens", currentToken));
             console.log("Token removed from Firestore");
             return true;
        }
    } catch(err) {
        console.error("Error unsubscribing:", err);
        return false;
    }
}
