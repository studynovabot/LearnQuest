// Firebase utilities for client-side
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { User } from '@/types';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWqEeO_-9OWKXK_MIoITnwnvPS0F5j4ANY",
  authDomain: "studynovabot.firebaseapp.com",
  projectId: "studynovabot",
  storageBucket: "studynovabot.appspot.com",
  messagingSenderId: "250481817155",
  appId: "1:250481817155:web:16ef3bbdb36bbc375dc6f6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Convert Firebase user to app User
export const convertFirebaseUserToUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  try {
    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    const userData = userDoc.data();

    // Create a user object with default values if Firestore data is missing
    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      isPro: userData?.isPro || false,
      subscriptionPlan: userData?.subscriptionPlan || 'free',
      subscriptionStatus: userData?.subscriptionStatus || 'trial',
      subscriptionExpiry: userData?.subscriptionExpiry?.toDate() || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      role: userData?.role || 'user',
      createdAt: userData?.createdAt?.toDate() || new Date(),
      updatedAt: userData?.updatedAt?.toDate() || new Date(),
      lastLogin: new Date(),
    };

    return user;
  } catch (error) {
    console.error('Error converting Firebase user:', error);
    
    // Return a basic user object if there's an error
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      isPro: false,
      subscriptionPlan: 'free',
      subscriptionStatus: 'trial',
      subscriptionExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(),
    };
  }
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Update last login time in Firestore
    await updateDoc(doc(db, 'users', firebaseUser.uid), {
      lastLogin: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return await convertFirebaseUserToUser(firebaseUser);
  } catch (error: any) {
    console.error('Firebase sign in error:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
};

// Register with email and password
export const registerWithEmail = async (email: string, displayName: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Update profile with display name
    await updateProfile(firebaseUser, { displayName });
    
    // Create user document in Firestore
    const userData = {
      email,
      displayName,
      isPro: false,
      subscriptionPlan: 'free',
      subscriptionStatus: 'trial',
      subscriptionExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      role: 'user',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    };
    
    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    
    return await convertFirebaseUserToUser(firebaseUser);
  } catch (error: any) {
    console.error('Firebase registration error:', error);
    throw new Error(error.message || 'Failed to register');
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Firebase sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

export { auth, db };