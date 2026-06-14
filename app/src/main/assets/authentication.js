// Firebase Authentication Module
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    sendPasswordResetEmail, 
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { auth } from "./firebase-config.js";

/**
 * Sign up a new user
 * @param {string} email 
 * @param {string} password 
 * @param {string} fullName 
 */
export const signUp = async (email, password, fullName) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update profile with full name
        await updateProfile(user, {
            displayName: fullName
        });
        
        return { user, error: null };
    } catch (error) {
        console.error("Signup Error:", error.code, error.message);
        return { user: null, error: error.message };
    }
};

/**
 * Sign in an existing user
 * @param {string} email 
 * @param {string} password 
 */
export const signIn = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user, error: null };
    } catch (error) {
        console.error("Login Error:", error.code, error.message);
        return { user: null, error: error.message };
    }
};

/**
 * Sign out the current user
 */
export const signOutUser = async () => {
    try {
        await signOut(auth);
        return { success: true, error: null };
    } catch (error) {
        console.error("Signout Error:", error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send a password reset email
 * @param {string} email 
 */
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true, error: null };
    } catch (error) {
        console.error("Password Reset Error:", error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Monitor Auth State Changes
 * @param {function} callback 
 */
export const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};
