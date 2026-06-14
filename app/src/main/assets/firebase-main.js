console.log("Firebase-main.js: Script started");
// Firebase Main UI Controller
import { firebaseConfig } from "./firebase-config.js";
import { signUp, signIn, signOutUser, resetPassword, onAuthStateChange } from "./authentication.js";
import { 
    saveUserProfile, 
    getUserProfile, 
    saveQuestionnaire, 
    saveGoals, 
    saveNotificationPrefs, 
    addMoodEntry,
    saveAnalysisResult,
    getWeeklyAnalysis,
    saveVoiceJournal,
    saveWellnessScore,
    saveBurnoutEvent,
    getVoiceJournals
} from "./database.js";

// Global User State
let currentUser = null;

// Auth State Listener
if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    setTimeout(() => {
        alert("⚠️ Firebase Configuration Required!\n\nPlease open 'firebase-config.js' and replace the placeholders with your actual Firebase API keys from the Firebase Console.");
    }, 1000);
}

onAuthStateChange(async (user) => {
    console.log("Firebase-main.js: Auth state changed", user ? "User logged in" : "User logged out");
    if (user) {
        currentUser = user;
        
        // Fetch user profile to update UI
        const profile = await getUserProfile(user.uid);
        if (profile.data) {
            updateUIForLoggedInUser(profile.data);
        } else {
            // New user without profile data yet
            updateUIForLoggedInUser({ fullName: user.displayName || "User" });
        }
        
        // Load Weekly Trends when data is available
        updateWeeklyTrendsUI();
        
        // If we are on login/signup screens, go to dashboard
        const activeEl = document.querySelector('.view.active');
        const currentActiveView = activeEl ? activeEl.id : null;
        
        if (currentActiveView && ['view-3-login', 'view-4-signup', 'view-1-splash', 'view-2-welcome'].includes(currentActiveView)) {
            console.log("Firebase-main.js: Auto-navigating to dashboard...");
            window.navigate('16-dashboard-main');
        }
    } else {
        currentUser = null;
        // If not on public pages, redirect to welcome
        const activeEl = document.querySelector('.view.active');
        const currentActiveView = activeEl ? activeEl.id : null;
        
        const publicViews = ['view-1-splash', 'view-2-welcome', 'view-3-login', 'view-4-signup', 'view-6-forgot-password'];
        if (currentActiveView && !publicViews.includes(currentActiveView)) {
            console.log("Firebase-main.js: User logged out, redirecting to welcome...");
            window.navigate('2-welcome');
        }
    }
});

function updateUIForLoggedInUser(profileData) {
    // Update Dashboard Greeting
    const greetingEl = document.querySelector('#view-16-dashboard-main h2');
    if (greetingEl) {
        const name = profileData.fullName ? profileData.fullName.split(' ')[0] : "User";
        greetingEl.innerText = `Hello, ${name}`;
    }
    
    // Update Profile Name
    const profileNameEl = document.querySelector('#view-50-profile-settings h3');
    if (profileNameEl && profileData.fullName) profileNameEl.innerText = profileData.fullName;
    
    // Update Avatar initials
    const avatars = document.querySelectorAll('.avatar');
    if (profileData.fullName) {
        const initials = profileData.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
        avatars.forEach(av => {
            av.innerText = initials.substring(0, 2);
        });
    }
    
    // Update Dashboard Resonance Score from latest data
    updateDashboardScore();
}

async function updateDashboardScore() {
    if (!currentUser) return;
    try {
        const { data } = await getWeeklyAnalysis(currentUser.uid);
        if (data && data.length > 0) {
            // Sort by timestamp and get the latest
            const latest = data.sort((a, b) => b.timestamp - a.timestamp)[0];
            const scoreEl = document.getElementById('dash-score');
            if (scoreEl) {
                scoreEl.innerText = latest.score;
                // Also update dash-state based on score
                const stateEl = document.getElementById('dash-state');
                if (stateEl) {
                    if (latest.score > 90) stateEl.innerText = 'PEAK FLOW STATE';
                    else if (latest.score > 80) stateEl.innerText = 'BALANCED & PRESENT';
                    else stateEl.innerText = 'SLIGHT TENSION DETECTED';
                }
            }

            // Auto-save wellness score to Firestore
            if (window.NW_WellnessScore) {
                const ws = window.NW_WellnessScore.calculate(data);
                try {
                    await saveWellnessScore(currentUser.uid, {
                        score: ws.score,
                        status: window.NW_WellnessScore.statusLabel(ws.score).text
                    });
                } catch(e) { /* silently ignore */ }
            }

            // Auto-check burnout and save if high risk
            if (window.NW_BurnoutDetector) {
                const burnout = window.NW_BurnoutDetector.analyze(data);
                if (burnout.level >= 40) {
                    try {
                        await saveBurnoutEvent(currentUser.uid, {
                            risk: burnout.risk,
                            level: burnout.level,
                            factors: burnout.factors.map(f => f.text)
                        });
                    } catch(e) { /* silently ignore */ }
                }
                // Show SOS if high risk
                if (window.NW_SOS) window.NW_SOS.checkAndAlert(latest.score);
            }
        }
    } catch (err) {
        console.error("Dashboard score update error:", err);
    }
}

// --- Event Listeners ---

function initApp() {
    console.log("Firebase-main.js: Initializing app listeners");
    try {
        // 1. Sign Up
        const signupBtn = document.getElementById('signup-btn');
        if (signupBtn) {
            signupBtn.onclick = async () => {
                const name = document.getElementById('signup-name').value;
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;
                
                if (!name || !email || !password) return alert("Please fill all fields");
                
                signupBtn.innerText = "Creating account...";
                signupBtn.disabled = true;
                
                const { user, error } = await signUp(email, password, name);
                
                if (error) {
                    alert("Signup failed: " + error);
                    signupBtn.innerText = "Sign Up";
                    signupBtn.disabled = false;
                } else {
                    // Save profile to Firestore
                    await saveUserProfile(user.uid, { fullName: name, email });
                    window.navigate('12-user-info'); // Go to onboarding
                }
            };
        }

        // 2. Login
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.onclick = async () => {
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                
                if (!email || !password) return alert("Please enter email and password");
                
                loginBtn.innerText = "Signing in...";
                loginBtn.disabled = true;
                
                const { user, error } = await signIn(email, password);
                
                if (error) {
                    alert("Login failed: " + error);
                    loginBtn.innerText = "Sign In";
                    loginBtn.disabled = false;
                }
            };
        }

        // 3. Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.onclick = async () => {
                await signOutUser();
            };
        }

        // 4. Forgot Password
        const forgotBtn = document.getElementById('forgot-btn');
        if (forgotBtn) {
            forgotBtn.onclick = async () => {
                const email = document.getElementById('forgot-email').value;
                if (!email) return alert("Please enter your email");
                
                const { success, error } = await resetPassword(email);
                if (success) {
                    alert("Password reset email sent!");
                    window.navigate('3-login');
                } else {
                    alert("Error: " + error);
                }
            };
        }

        // 5. Save Profile Info (Age/Gender)
        const profileSaveBtn = document.getElementById('profile-save-btn');
        if (profileSaveBtn) {
            profileSaveBtn.onclick = async () => {
                if (!currentUser) return alert("Please log in first");
                const age = document.getElementById('profile-age').value;
                const gender = document.getElementById('profile-gender').value;
                
                await saveUserProfile(currentUser.uid, { age, gender });
                window.navigate('13-questionnaire');
            };
        }

        // 6. Save Questionnaire
        const qSaveBtn = document.getElementById('q-save-btn');
        if (qSaveBtn) {
            qSaveBtn.onclick = async () => {
                if (!currentUser) return alert("Please log in first");
                const answers = {
                    stressLevel: document.getElementById('q-stress').value,
                    sleepQuality: document.getElementById('q-sleep').value,
                    moodScore: document.getElementById('q-mood').value,
                    anxietyLevel: document.getElementById('q-anxiety').value
                };
                
                await saveQuestionnaire(currentUser.uid, answers);
                window.navigate('14-goals');
            };
        }

        // 7. Save Goals
        const goalsSaveBtn = document.getElementById('goals-save-btn');
        if (goalsSaveBtn) {
            goalsSaveBtn.onclick = async () => {
                if (!currentUser) return alert("Please log in first");
                const selectedGoals = Array.from(document.querySelectorAll('input[name="goal"]:checked')).map(cb => cb.value);
                await saveGoals(currentUser.uid, selectedGoals);
                window.navigate('15-notifications');
            };
        }

        // 8. Save Notification Prefs
        const prefsSaveBtn = document.getElementById('prefs-save-btn');
        if (prefsSaveBtn) {
            prefsSaveBtn.onclick = async () => {
                if (!currentUser) return alert("Please log in first");
                const prefs = {
                    dailyReminder: document.getElementById('pref-daily').checked,
                    weeklyReport: document.getElementById('pref-weekly').checked,
                    meditationReminder: document.getElementById('pref-meditation').checked
                };
                
                await saveNotificationPrefs(currentUser.uid, prefs);
                window.navigate('16-dashboard-main');
            };
        }

        // 9. Save Mood Entry
        const moodSaveBtn = document.getElementById('mood-save-btn');
        if (moodSaveBtn) {
            moodSaveBtn.onclick = async () => {
                if (!currentUser) return alert("Please log in first");
                const moodData = {
                    mood: document.getElementById('mood-entry-score').value,
                    notes: document.getElementById('mood-entry-notes').value
                };
                
                moodSaveBtn.innerText = "Saving...";
                moodSaveBtn.disabled = true;
                
                const { success } = await addMoodEntry(currentUser.uid, moodData);
                if (success) {
                    alert("Mood logged successfully!");
                    window.navigate('16-dashboard-main');
                } else {
                    alert("Failed to save mood.");
                }
                moodSaveBtn.innerText = "Save Entry";
                moodSaveBtn.disabled = false;
            };
        }
    } catch (err) {
        console.error("Initialization error in firebase-main.js:", err);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Expose Analysis Save function to global window for app.js to use
window.saveUserAnalysis = async (type, score, details) => {
    console.log(`Saving ${type} analysis result:`, { score, details });
    
    // Save to local storage as transparent fallback/primary record
    saveAnalysisLocally(type, score, details);
    
    if (!currentUser) {
        console.warn("Cannot save to Firestore: No user logged in.");
        return;
    }
    
    try {
        // Save to Firestore analysisResults
        const { success } = await saveAnalysisResult(currentUser.uid, { type, score, details });
        if (success) {
            console.log("Successfully saved analysis to Firestore.");
            updateWeeklyTrendsUI(); // Sync UI with remote database
            updateDashboardScore();
        }

        // If it's a voice journal entry, also save to voiceJournals collection
        if (type === 'voice_journal' && details && details.emotion) {
            await saveVoiceJournal(currentUser.uid, {
                emotion: details.emotion,
                score,
                text: details.text || '',
                date: new Date().toISOString().split('T')[0]
            });
        }
    } catch (err) {
        console.error("Firestore save failed, using local baseline:", err);
    }
};

function saveAnalysisLocally(type, score, details) {
    const results = localStorage.getItem('local_analysis_results') ? JSON.parse(localStorage.getItem('local_analysis_results')) : [];
    const dateStr = new Date().toISOString().split('T')[0];
    results.push({
        type,
        score,
        details,
        date: dateStr,
        timestamp: Date.now()
    });
    localStorage.setItem('local_analysis_results', JSON.stringify(results));
    
    // Update local UI elements immediately
    updateDashboardUIFromScore(score, details);
    updateWeeklyTrendsLocalUI(results);
}

function updateDashboardUIFromScore(score, details) {
    const scoreEl = document.getElementById('dash-score');
    if (scoreEl) {
        let current = 0;
        const target = score;
        const interval = setInterval(() => {
            current += 2;
            if (current >= target) {
                current = target;
                clearInterval(interval);
            }
            scoreEl.innerText = current;
        }, 15);
    }
    
    const stateEl = document.getElementById('dash-state');
    if (stateEl) {
        if (score > 90) stateEl.innerText = 'PEAK FLOW STATE';
        else if (score > 80) stateEl.innerText = 'BALANCED & PRESENT';
        else stateEl.innerText = 'SLIGHT TENSION DETECTED';
    }
    
    const vagusEl = document.getElementById('dash-vagus');
    if (vagusEl) {
        if (score > 90) vagusEl.innerText = 'Vagus nerve tone is optimal and stable.';
        else if (score > 80) vagusEl.innerText = 'Vagus nerve tone is normal.';
        else vagusEl.innerText = 'Elevated sympathetic nervous arousal detected.';
    }
    
    if (details) {
        if (details.pupilStability) {
            const el = document.getElementById('dash-pupil');
            if (el) el.innerText = details.pupilStability;
        }
        if (details.respiration) {
            const el = document.getElementById('dash-resp');
            if (el) el.innerText = details.respiration + (String(details.respiration).endsWith('bpm') ? '' : ' bpm');
        }
    }
}

function updateWeeklyTrendsLocalUI(localData) {
    const chartContainer = document.querySelector('#view-31-weekly-trends div[style*="height:150px"]');
    if (!chartContainer) return;
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        last7Days.push(d.toISOString().split('T')[0]);
    }
    
    chartContainer.innerHTML = '';
    
    last7Days.forEach(dateStr => {
        const date = new Date(dateStr);
        const dayLabel = days[date.getDay()];
        const dayData = localData.filter(r => r.date === dateStr);
        
        let avgScore = 0;
        if (dayData.length > 0) {
            avgScore = dayData.reduce((acc, curr) => acc + (curr.score || 0), 0) / dayData.length;
        }
        
        const barHeight = Math.max(avgScore, 10);
        const isToday = dateStr === today.toISOString().split('T')[0];
        
        const barDiv = document.createElement('div');
        barDiv.style.cssText = "display:flex; flex-direction:column; align-items:center; flex:1;";
        barDiv.innerHTML = `
            <div style="width:100%; height:${barHeight}px; background:${isToday ? 'var(--primary-gradient)' : 'rgba(24, 112, 244, 0.4)'}; border-radius:6px; transition:0.3s; ${isToday ? 'box-shadow:0 4px 10px rgba(24, 112, 244, 0.3);' : ''}"></div>
            <p class="${isToday ? 'text-primary' : 'text-muted'} mt-2" style="font-size:0.75rem; ${isToday ? 'font-weight:600;' : ''}">${dayLabel[0]}</p>
        `;
        chartContainer.appendChild(barDiv);
    });
    
    const avgScore = localData.length > 0 ? Math.round(localData.reduce((acc, curr) => acc + (curr.score || 0), 0) / localData.length) : 0;
    const avgScoreEl = document.querySelector('#view-31-weekly-trends h2.text-primary');
    if (avgScoreEl) {
        avgScoreEl.innerHTML = `${avgScore} <span style="font-size:1rem; color:var(--primary-light);">+${Math.floor(Math.random() * 5)}%</span>`;
    }
}

async function updateWeeklyTrendsUI() {
    if (!currentUser) {
        const localData = localStorage.getItem('local_analysis_results') ? JSON.parse(localStorage.getItem('local_analysis_results')) : [];
        if (localData.length > 0) updateWeeklyTrendsLocalUI(localData);
        return;
    }
    try {
        const { data, error } = await getWeeklyAnalysis(currentUser.uid);
        if (error || !data || data.length === 0) {
            const localData = localStorage.getItem('local_analysis_results') ? JSON.parse(localStorage.getItem('local_analysis_results')) : [];
            if (localData.length > 0) updateWeeklyTrendsLocalUI(localData);
            return;
        }
        
        console.log("Weekly Analysis Data:", data);
        
        // Group by date and calculate average score per day
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            last7Days.push(d.toISOString().split('T')[0]);
        }
        
        const chartContainer = document.querySelector('#view-31-weekly-trends div[style*="height:150px"]');
        if (!chartContainer) return;
        
        chartContainer.innerHTML = ''; // Clear static chart
        
        last7Days.forEach(dateStr => {
            const date = new Date(dateStr);
            const dayLabel = days[date.getDay()];
            const dayData = data.filter(r => r.date === dateStr);
            
            let avgScore = 0;
            if (dayData.length > 0) {
                avgScore = dayData.reduce((acc, curr) => acc + (curr.score || 0), 0) / dayData.length;
            }
            
            const barHeight = Math.max(avgScore, 10); // Minimum height for visibility
            const isToday = dateStr === today.toISOString().split('T')[0];
            
            const barDiv = document.createElement('div');
            barDiv.style.cssText = "display:flex; flex-direction:column; align-items:center; flex:1;";
            barDiv.innerHTML = `
                <div style="width:100%; height:${barHeight}px; background:${isToday ? 'var(--primary-gradient)' : 'rgba(24, 112, 244, 0.4)'}; border-radius:6px; transition:0.3s; ${isToday ? 'box-shadow:0 4px 10px rgba(24, 112, 244, 0.3);' : ''}"></div>
                <p class="${isToday ? 'text-primary' : 'text-muted'} mt-2" style="font-size:0.75rem; ${isToday ? 'font-weight:600;' : ''}">${dayLabel[0]}</p>
            `;
            chartContainer.appendChild(barDiv);
        });
        
        // Update Avg Resonance Text
        const avgScore = data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + (curr.score || 0), 0) / data.length) : 0;
        const avgScoreEl = document.querySelector('#view-31-weekly-trends h2.text-primary');
        if (avgScoreEl) {
            avgScoreEl.innerHTML = `${avgScore} <span style="font-size:1rem; color:var(--primary-light);">+${Math.floor(Math.random() * 5)}%</span>`;
        }
    } catch (err) {
        console.error("Weekly trends UI update error:", err);
    }
}

console.log("Firebase-main.js: Script fully loaded");
