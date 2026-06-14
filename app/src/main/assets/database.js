// Firebase Firestore Database Module
import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { db } from "./firebase-config.js";

/**
 * Save or Update User Profile Information
 * @param {string} uid 
 * @param {object} userData { fullName, age, gender, email }
 */
export const saveUserProfile = async (uid, userData) => {
    try {
        await setDoc(doc(db, "users", uid), {
            ...userData,
            updatedAt: serverTimestamp()
        }, { merge: true });
        return { success: true };
    } catch (error) {
        console.error("Save Profile Error:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Fetch User Profile Information
 * @param {string} uid 
 */
export const getUserProfile = async (uid) => {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { data: docSnap.data(), error: null };
        } else {
            return { data: null, error: "No profile found" };
        }
    } catch (error) {
        return { data: null, error: error.message };
    }
};

/**
 * Save Mental Health Questionnaire Results
 * @param {string} uid 
 * @param {object} answers { stressLevel, sleepQuality, moodScore, anxietyLevel }
 */
export const saveQuestionnaire = async (uid, answers) => {
    try {
        await setDoc(doc(db, "questionnaire", uid), {
            uid,
            ...answers,
            timestamp: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Save Goal Selections
 * @param {string} uid 
 * @param {Array} goals ['Reduce Stress', 'Improve Sleep', etc.]
 */
export const saveGoals = async (uid, goals) => {
    try {
        await setDoc(doc(db, "goals", uid), {
            uid,
            goals,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Add Mood Tracking Entry
 * @param {string} uid 
 * @param {object} moodData { mood, notes }
 */
export const addMoodEntry = async (uid, moodData) => {
    try {
        const moodRef = collection(db, "moodTracking");
        await addDoc(moodRef, {
            uid,
            ...moodData,
            timestamp: serverTimestamp(),
            date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Fetch Mood History
 * @param {string} uid 
 */
export const getMoodHistory = async (uid) => {
    try {
        const q = query(collection(db, "moodTracking"), where("uid", "==", uid));
        const querySnapshot = await getDocs(q);
        const history = [];
        querySnapshot.forEach((doc) => {
            history.push({ id: doc.id, ...doc.data() });
        });
        return { data: history, error: null };
    } catch (error) {
        return { data: null, error: error.message };
    }
};

/**
 * Save Notification Preferences
 * @param {string} uid 
 * @param {object} prefs { dailyReminder, weeklyReport, meditationReminder }
 */
export const saveNotificationPrefs = async (uid, prefs) => {
    try {
        await setDoc(doc(db, "notifications", uid), {
            uid,
            ...prefs,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Save Analysis Result (Face/Voice)
 * @param {string} uid 
 * @param {object} analysisData { type, score, details }
 */
export const saveAnalysisResult = async (uid, analysisData) => {
    try {
        const analysisRef = collection(db, "analysisResults");
        await addDoc(analysisRef, {
            uid,
            ...analysisData,
            timestamp: serverTimestamp(),
            date: new Date().toISOString().split('T')[0]
        });
        return { success: true };
    } catch (error) {
        console.error("Save Analysis Error:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Fetch Weekly Analysis Data
 * @param {string} uid 
 */
export const getWeeklyAnalysis = async (uid) => {
    try {
        const q = query(
            collection(db, "analysisResults"), 
            where("uid", "==", uid)
        );
        const querySnapshot = await getDocs(q);
        const results = [];
        querySnapshot.forEach((doc) => {
            results.push(doc.data());
        });
        return { data: results, error: null };
    } catch (error) {
        return { data: null, error: error.message };
    }
};

// ─────────────────────────────────────────────────────────────────
// ADVANCED FEATURES — New Firestore Collections (v2)
// ─────────────────────────────────────────────────────────────────

/**
 * Save Voice Journal Entry
 * @param {string} uid
 * @param {object} entry { text, emotion, emotionColor, score, insight, date }
 */
export const saveVoiceJournal = async (uid, entry) => {
    try {
        const journalRef = collection(db, "users", uid, "voiceJournals");
        await addDoc(journalRef, {
            ...entry,
            uid,
            timestamp: serverTimestamp(),
            date: new Date().toISOString().split('T')[0]
        });
        return { success: true };
    } catch (error) {
        console.error("Save Voice Journal Error:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Get Voice Journal Entries
 * @param {string} uid
 */
export const getVoiceJournals = async (uid) => {
    try {
        const q = query(collection(db, "users", uid, "voiceJournals"));
        const snap = await getDocs(q);
        const journals = [];
        snap.forEach(doc => journals.push({ id: doc.id, ...doc.data() }));
        // Sort by timestamp descending
        journals.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
        return { data: journals, error: null };
    } catch (error) {
        return { data: null, error: error.message };
    }
};

/**
 * Save Wellness Score
 * @param {string} uid
 * @param {object} scoreData { score, breakdown, status }
 */
export const saveWellnessScore = async (uid, scoreData) => {
    try {
        const scoresRef = collection(db, "users", uid, "wellnessScores");
        await addDoc(scoresRef, {
            ...scoreData,
            uid,
            timestamp: serverTimestamp(),
            date: new Date().toISOString().split('T')[0]
        });
        // Also update the user's latest score in their profile
        await setDoc(doc(db, "users", uid), {
            latestWellnessScore: scoreData.score,
            wellnessUpdatedAt: serverTimestamp()
        }, { merge: true });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Get Wellness Score History
 * @param {string} uid
 * @param {number} days - Number of days to look back (default 30)
 */
export const getWellnessScoreHistory = async (uid, days = 30) => {
    try {
        const q = query(collection(db, "users", uid, "wellnessScores"));
        const snap = await getDocs(q);
        const scores = [];
        snap.forEach(doc => scores.push({ id: doc.id, ...doc.data() }));
        scores.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
        return { data: scores.slice(0, days), error: null };
    } catch (error) {
        return { data: null, error: error.message };
    }
};

/**
 * Save Burnout Detection Event
 * @param {string} uid
 * @param {object} burnoutData { risk, level, factors }
 */
export const saveBurnoutEvent = async (uid, burnoutData) => {
    try {
        const burnoutRef = collection(db, "users", uid, "burnoutEvents");
        await addDoc(burnoutRef, {
            ...burnoutData,
            uid,
            timestamp: serverTimestamp(),
            date: new Date().toISOString().split('T')[0]
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Save Daily Wellness Plan
 * @param {string} uid
 * @param {object} planData { slots, baseScore, date }
 */
export const saveWellnessPlan = async (uid, planData) => {
    try {
        const date = new Date().toISOString().split('T')[0];
        // Store as a daily document (overwrite today's plan)
        await setDoc(doc(db, "users", uid, "wellnessPlans", date), {
            ...planData,
            uid,
            date,
            createdAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Get Today's Wellness Plan
 * @param {string} uid
 */
export const getTodayWellnessPlan = async (uid) => {
    try {
        const date = new Date().toISOString().split('T')[0];
        const docRef = doc(db, "users", uid, "wellnessPlans", date);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { data: docSnap.data(), error: null };
        }
        return { data: null, error: "No plan for today" };
    } catch (error) {
        return { data: null, error: error.message };
    }
};

/**
 * Save Analytics Cache (to avoid recomputing on every load)
 * @param {string} uid
 * @param {string} period - 'weekly' | 'monthly' | 'quarterly'
 * @param {object} analyticsData
 */
export const saveAnalyticsCache = async (uid, period, analyticsData) => {
    try {
        await setDoc(doc(db, "users", uid, "analyticsCache", period), {
            ...analyticsData,
            period,
            cachedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Get Cached Analytics
 * @param {string} uid
 * @param {string} period
 */
export const getAnalyticsCache = async (uid, period) => {
    try {
        const docRef = doc(db, "users", uid, "analyticsCache", period);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { data: docSnap.data(), error: null };
        }
        return { data: null, error: "No cached analytics" };
    } catch (error) {
        return { data: null, error: error.message };
    }
};
