// Firebase utilities for client-side
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { User } from '@/types';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmCZ88FJUX5E1yVVj8-jm_kK0HhTDzmPc",  // Updated API key
  authDomain: "studynovabot.firebaseapp.com", 
  projectId: "studynovabot",
  storageBucket: "studynovabot.appspot.com",
  messagingSenderId: "250481817155",
  appId: "1:250481817155:web:16ef3bbdb36bbc375dc6f6"
};

// Log the actual Firebase config being used for debugging
console.log("Firebase config being used:", JSON.stringify(firebaseConfig));

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
    console.log('Attempting to sign in with Firebase auth...', { email });
    
    // First try to create the user if it doesn't exist (for testing/development)
    if (email === 'thakurranveersingh505@gmail.com' && password === 'India#321') {
      try {
        console.log('Attempting to create a test account first...');
        // Try to register this account if it doesn't exist
        await createUserWithEmailAndPassword(auth, email, password)
          .then(userCredential => {
            console.log('Test account created successfully');
            return updateProfile(userCredential.user, { displayName: 'Ranveer Singh' });
          })
          .catch(regError => {
            // If error is not because user already exists, log it
            if (regError.code !== 'auth/email-already-in-use') {
              console.log('Error creating test account:', regError.code, regError.message);
            } else {
              console.log('Test account already exists, proceeding with login');
            }
          });
      } catch (regError) {
        console.log('Registration attempt failed, proceeding with login');
      }
    }
    
    // Proceed with login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Firebase authentication successful');
    
    const firebaseUser = userCredential.user;
    console.log('Firebase user details:', { 
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName 
    });
    
    // Update last login time in Firestore
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('Updated last login time in Firestore');
    } catch (updateError) {
      console.error('Error updating last login in Firestore:', updateError);
      
      // Create user document if it doesn't exist
      try {
        console.log('Attempting to create user document in Firestore');
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          email: firebaseUser.email || email,
          displayName: firebaseUser.displayName || 'User',
          isPro: false,
          subscriptionPlan: 'free',
          subscriptionStatus: 'trial',
          subscriptionExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          role: 'user',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
        console.log('User document created in Firestore');
      } catch (createDocError) {
        console.error('Failed to create user document:', createDocError);
      }
    }
    
    return await convertFirebaseUserToUser(firebaseUser);
  } catch (error: any) {
    console.error('Firebase sign in error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Add helpful error messages for common errors
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email address. Please register first.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again or reset your password.');
    } else if (error.code === 'auth/invalid-credential') {
      throw new Error('Invalid login credentials. Please check your email and password.');
    } else if (error.code === 'auth/api-key-not-valid') {
      throw new Error('Authentication service is currently unavailable. Please try again later.');
    } else {
      throw new Error(error.message || 'Failed to sign in');
    }
  }
};

// Register with email and password
export const registerWithEmail = async (email: string, displayName: string, password: string): Promise<User> => {
  try {
    console.log('Attempting to register with Firebase auth...', { email, displayName });
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Firebase user created successfully');
    
    const firebaseUser = userCredential.user;
    console.log('Firebase user details:', { 
      uid: firebaseUser.uid,
      email: firebaseUser.email
    });
    
    // Update profile with display name
    try {
      await updateProfile(firebaseUser, { displayName });
      console.log('User profile updated with display name');
    } catch (profileError) {
      console.error('Error updating profile with display name:', profileError);
    }
    
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
    
    console.log('Creating user document in Firestore...');
    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      console.log('User document created in Firestore successfully');
    } catch (firestoreError) {
      console.error('Error creating user document in Firestore:', firestoreError);
      // Continue anyway since authentication was successful
    }
    
    return await convertFirebaseUserToUser(firebaseUser);
  } catch (error: any) {
    console.error('Firebase registration error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Add helpful error messages for common registration errors
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please login or use a different email.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use a stronger password.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email format. Please check your email address.');
    } else if (error.code === 'auth/api-key-not-valid') {
      throw new Error('Registration service is currently unavailable. Please try again later.');
    } else {
      throw new Error(error.message || 'Failed to register');
    }
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