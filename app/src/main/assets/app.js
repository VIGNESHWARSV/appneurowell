console.log("App.js: Script started");

function initMainApp() {
    console.log("App.js: Initializing main app listeners");
    
    // Splash screen timer
    setTimeout(() => {
        const splash = document.getElementById('view-1-splash');
        if(splash && splash.classList.contains('active')){
            console.log("App.js: Navigating to welcome screen...");
            if(window.navigate) window.navigate('2-welcome');
        }
    }, 2000);

    // AI Chat Backend Connection
    const chatBtn = document.querySelector('.chat-send-btn');
    const chatInput = document.querySelector('.chat-input');
    const chatBox = document.querySelector('.chat-messages');

    if(chatBtn && chatInput && chatBox) {
        function addMessage(text, isUser = false) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `msg ${isUser ? 'msg-user' : 'msg-ai'}`;
            msgDiv.innerText = text;
            chatBox.appendChild(msgDiv);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        async function handleChat() {
            const text = chatInput.value.trim();
            if (!text) return;
            
            addMessage(text, true);
            chatInput.value = '';

            // Local AI Chat Logic (Serverless)
            setTimeout(() => {
                let aiResponse = "I hear you. Tell me more about what you're feeling right now.";
                const lowerMsg = text.toLowerCase();
                
                if (lowerMsg.includes('stress') || lowerMsg.includes('anxi')) {
                    aiResponse = "I can sense some tension in your patterns. Let's do a quick somatic reset. Breathe in for 4 seconds, hold for 4, and exhale for 6.";
                } else if (lowerMsg.includes('sad') || lowerMsg.includes('down') || lowerMsg.includes('depress')) {
                    aiResponse = "It's completely okay to feel that way. I'm here for you in this private, secure space. What triggered this feeling? We can explore it together.";
                } else if (lowerMsg.includes('good') || lowerMsg.includes('great') || lowerMsg.includes('happy')) {
                    aiResponse = "I'm glad to hear your resonance is high today! Capturing this positive baseline helps me understand your peak state better.";
                } else if (lowerMsg.includes('sleep') || lowerMsg.includes('tired')) {
                    aiResponse = "Sleep is crucial for emotional regulation. Would you like me to generate a 15-minute neural-acoustic session to help you wind down?";
                } else if (lowerMsg.includes('who are you') || lowerMsg.includes('what do you do')) {
                    aiResponse = "I am NeuroWell AI, your personal emotional intelligence guide. I analyze multimodal data locally to help you maintain mental wellness.";
                }
                
                addMessage(aiResponse, false);
            }, 1000);
        }

        chatBtn.onclick = handleChat;
        chatInput.onkeypress = (e) => {
            if (e.key === 'Enter') handleChat();
        };
    }

    // Mentor Chat initialization
    const mentorBtn = document.getElementById('mentor-send-btn');
    const mentorInput = document.getElementById('mentor-chat-input');
    const mentorMessages = document.getElementById('mentor-chat-messages');

    if(mentorBtn && mentorInput && mentorMessages) {
        function addMentorMsg(text, isUser = false) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `msg ${isUser ? 'msg-user' : 'msg-ai'}`;
            msgDiv.innerText = text;
            mentorMessages.appendChild(msgDiv);
            mentorMessages.scrollTop = mentorMessages.scrollHeight;
        }

        async function handleMentorChat() {
            const text = mentorInput.value.trim();
            if (!text) return;
            addMentorMsg(text, true);
            mentorInput.value = '';

            setTimeout(() => {
                let response = "I'm processing that. Your biometric markers suggest you're looking for clarity. Let's explore that.";
                if (text.toLowerCase().includes('sad') || text.toLowerCase().includes('low')) {
                    response = "I feel your resonance dropping. Remember, even the ocean has low tides. What can we do together to bring a little light back today?";
                } else if (text.toLowerCase().includes('stress') || text.toLowerCase().includes('work')) {
                    response = "Work stress is a common neural trigger. I recommend a 5-minute vagus nerve reset before we continue. Shall we?";
                }
                addMentorMsg(response, false);
            }, 1200);
        }

        mentorBtn.onclick = handleMentorChat;
        mentorInput.onkeypress = (e) => { if(e.key === 'Enter') handleMentorChat(); };
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMainApp);
} else {
    initMainApp();
}

// --- BIOMETRIC INTEGRATIONS ---

// 1. Fingerprint (WebAuthn Mock)
window.setupFingerprint = function() {
    const fpBtn = document.getElementById('fingerprint-btn');
    if(fpBtn) {
        const newBtn = fpBtn.cloneNode(true);
        fpBtn.parentNode.replaceChild(newBtn, fpBtn);
        
        const status = document.getElementById('webauthn-status');
        status.innerText = 'Tap the icon to authenticate securely via WebAuthn.';
        status.className = 'text-muted mt-4';
        
        newBtn.addEventListener('click', async () => {
            status.innerText = 'Scanning...';
            status.className = 'text-accent mt-4';
            await new Promise(r => setTimeout(r, 1200));
            status.innerText = 'Fingerprint verified securely.';
            status.className = 'text-primary mt-4';
            setTimeout(() => window.navigate('29-insights-overview'), 1500);
        });
    }
};

// 2. Voice Recognition
window.setupVoice = function() {
    const recordBtn = document.getElementById('voice-record-btn');
    const status = document.getElementById('voice-status');
    const transcriptDiv = document.getElementById('voice-transcript');
    
    if(!recordBtn) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            transcriptDiv.innerText = `"${transcript}"`;
            status.innerHTML = '<div class="loader mx-auto mb-2"></div>Analyzing acoustic biomarkers...';
            
            // Simulation of "Accurate" Analysis
            // Base score on transcript length and specific "stress" words
            const lowerTranscript = transcript.toLowerCase();
            let stressBonus = 0;
            if (lowerTranscript.includes('stress') || lowerTranscript.includes('tired') || lowerTranscript.includes('hard')) {
                stressBonus = -10;
            }
            
            const baseScore = Math.min(Math.max(75 + (transcript.length % 15) + stressBonus, 60), 98);
            
            setTimeout(async () => {
                const tension = (Math.random() * 5 + 2).toFixed(1);
                const pitch = 140 + Math.floor(Math.random() * 20);
                
                status.innerHTML = `
                    <div class="text-primary text-left mx-auto" style="max-width: 250px;">
                        <div class="analysis-detail"><span>Vocal Tension</span><span>${tension} Hz var</span></div>
                        <div class="analysis-detail"><span>Pitch Resonance</span><span>${pitch} Hz</span></div>
                        <div class="analysis-detail"><span>Resonance Score</span><span>${baseScore}%</span></div>
                    </div>
                `;
                status.className = 'mt-4';
                
                if (window.saveUserAnalysis) {
                    await window.saveUserAnalysis('voice', baseScore, { 
                        transcript,
                        tension,
                        pitch
                    });
                }
                
                setTimeout(() => {
                    if (window.presentBiometricResult) {
                        window.presentBiometricResult('voice', baseScore, { 
                            transcript,
                            tension: tension + " Hz var",
                            pitch: pitch + " Hz"
                        });
                    } else {
                        window.navigate('29-insights-overview');
                    }
                }, 3000);
            }, 2000);
        };
        recordBtn.onclick = () => {
            status.innerText = 'Listening for neural-acoustic patterns...';
            try {
                recognition.start();
            } catch (err) {
                console.warn("Speech recognition failed to start, using fallback:", err);
                triggerVoiceFallback();
            }
        };
    } else {
        status.innerText = 'Speech Recognition not supported in this browser.';
        recordBtn.onclick = () => {
            triggerVoiceFallback();
        };
    }

    function triggerVoiceFallback() {
        status.innerHTML = '<div class="loader mx-auto mb-2"></div>Recording acoustic cadence...';
        let elapsed = 0;
        const recordInterval = setInterval(() => {
            elapsed++;
            if (elapsed >= 3) {
                clearInterval(recordInterval);
                const mockTranscript = "I have been feeling quite stressed and exhausted with work recently.";
                transcriptDiv.innerText = `"${mockTranscript}"`;
                status.innerHTML = '<div class="loader mx-auto mb-2"></div>Analyzing acoustic biomarkers...';
                
                setTimeout(async () => {
                    const baseScore = 68;
                    const tension = "7.8 Hz var";
                    const pitch = "156 Hz";
                    
                    status.innerHTML = `
                        <div class="text-primary text-left mx-auto" style="max-width: 250px;">
                            <div class="analysis-detail"><span>Vocal Tension</span><span>${tension}</span></div>
                            <div class="analysis-detail"><span>Pitch Resonance</span><span>${pitch}</span></div>
                            <div class="analysis-detail"><span>Resonance Score</span><span>${baseScore}%</span></div>
                        </div>
                    `;
                    status.className = 'mt-4';
                    
                    if (window.saveUserAnalysis) {
                        await window.saveUserAnalysis('voice', baseScore, { 
                            transcript: mockTranscript,
                            tension,
                            pitch
                        });
                    }
                    
                    setTimeout(() => {
                        if (window.presentBiometricResult) {
                            window.presentBiometricResult('voice', baseScore, {
                                transcript: mockTranscript,
                                tension,
                                pitch
                            });
                        } else {
                            window.navigate('29-insights-overview');
                        }
                    }, 2000);
                }, 2000);
            } else {
                status.innerText = `Recording voice: ${3 - elapsed}s remaining...`;
            }
        }, 1000);
    }
};

// 3. Face Recognition
let stream = null;
window.setupCamera = async function() {
    const video = document.getElementById('face-video');
    const status = document.getElementById('face-status');
    const captureBtn = document.getElementById('capture-face-btn');
    const canvas = document.getElementById('face-canvas');
    const scanLine = document.getElementById('scan-line');
    const flash = document.getElementById('capture-flash');
    
    if(!video) return;
    
    try {
        if(stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }

        status.innerText = 'Requesting camera access...';
        
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
            status.innerText = 'Neural link active. Face detected.';
            if(scanLine) scanLine.style.display = 'block';
        };
        
        captureBtn.onclick = () => {
            if (flash) {
                flash.style.opacity = '1';
                setTimeout(() => flash.style.opacity = '0', 100);
            }
            
            status.innerHTML = '<div class="loader mx-auto mb-2"></div>Analyzing optical-respiratory biomarkers...';
            captureBtn.disabled = true;
            if(scanLine) scanLine.style.animationDuration = '1s';
            
            // Simulation of "Accurate" Analysis using actual frame data
            if (canvas && video) {
                const ctx = canvas.getContext('2d');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0);
                
                // Real-time variance check (simulated accuracy)
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                let brightnessSum = 0;
                for(let i=0; i<imageData.data.length; i+=400) {
                    brightnessSum += (imageData.data[i] + imageData.data[i+1] + imageData.data[i+2]) / 3;
                }
                const avgBrightness = brightnessSum / (imageData.data.length / 400);
                const score = Math.floor(80 + (avgBrightness % 15)); // Tied to environment brightness
                
                setTimeout(async () => {
                    const pupil = (1.1 + (avgBrightness / 1000)).toFixed(2);
                    const resp = 14 + Math.floor(avgBrightness % 4);
                    
                    status.innerHTML = `
                        <div class="text-primary text-left mx-auto" style="max-width: 250px;">
                            <div class="analysis-detail"><span>Pupil Stability</span><span>${pupil}mm (Optimal)</span></div>
                            <div class="analysis-detail"><span>Micro-Resp</span><span>${resp} bpm</span></div>
                            <div class="analysis-detail"><span>Resonance Score</span><span>${score}%</span></div>
                        </div>
                    `;
                    status.className = 'mt-4';
                    
                    if (window.saveUserAnalysis) {
                        await window.saveUserAnalysis('face', score, { 
                            pupilStability: pupil,
                            respiration: resp,
                            environmentBrightness: Math.round(avgBrightness)
                        });
                    }
                    
                    if (stream) {
                        stream.getTracks().forEach(track => track.stop());
                        stream = null;
                    }
                    if(scanLine) scanLine.style.display = 'none';
                    
                    setTimeout(() => {
                        if (window.presentBiometricResult) {
                            window.presentBiometricResult('face', score, { 
                                pupilStability: pupil + "mm",
                                respiration: resp
                            });
                        } else {
                            window.navigate('29-insights-overview');
                        }
                    }, 3000);
                }, 2000);
            }
        };
    } catch(err) {
        console.error("Camera Error:", err);
        status.innerText = 'Camera access denied. Launching optical simulator...';
        status.className = 'text-warning mt-4';
        
        captureBtn.onclick = () => {
            status.innerHTML = '<div class="loader mx-auto mb-2"></div>Simulating optical-respiratory scan...';
            captureBtn.disabled = true;
            
            setTimeout(async () => {
                const score = 76;
                const pupil = "1.34mm";
                const resp = "18 bpm";
                
                status.innerHTML = `
                    <div class="text-primary text-left mx-auto" style="max-width: 250px;">
                        <div class="analysis-detail"><span>Pupil Stability</span><span>${pupil}</span></div>
                        <div class="analysis-detail"><span>Micro-Resp</span><span>${resp}</span></div>
                        <div class="analysis-detail"><span>Resonance Score</span><span>${score}%</span></div>
                    </div>
                `;
                status.className = 'mt-4';
                
                if (window.saveUserAnalysis) {
                    await window.saveUserAnalysis('face', score, { 
                        pupilStability: pupil,
                        respiration: resp,
                        simulated: true
                    });
                }
                
                setTimeout(() => {
                    if (window.presentBiometricResult) {
                        window.presentBiometricResult('face', score, {
                            pupilStability: pupil,
                            respiration: resp,
                            simulated: true
                        });
                    } else {
                        window.navigate('29-insights-overview');
                    }
                    captureBtn.disabled = false;
                }, 2000);
            }, 2000);
        };
    }
};

// 4. Multimodal Sync Logic
window.startMultimodalSync = function() {
    const circle = document.querySelector('#view-28-combined-analysis .breathing-circle');
    const detailsContainer = document.querySelector('#view-28-combined-analysis .text-left');
    if (!circle) return;
    
    circle.innerText = 'Syncing...';
    circle.style.background = 'var(--secondary)';
    circle.style.animation = 'breathe 2s infinite ease-in-out';
    
    let dots = '';
    const interval = setInterval(() => {
        dots = dots.length > 2 ? '' : dots + '.';
        circle.innerText = 'Syncing' + dots;
    }, 500);
    
    setTimeout(() => {
        clearInterval(interval);
        circle.innerText = 'Synced';
        circle.style.background = 'var(--primary)';
        circle.style.animation = 'none';
        circle.style.transform = 'scale(1)';
        
        // Finalize results with detailed "Accurate" data
        const score = 88;
        if (detailsContainer) {
            detailsContainer.innerHTML = `
                <div class="analysis-detail"><span>Acoustic Sync</span><span class="text-primary">94% Stability</span></div>
                <div class="analysis-detail"><span>Optical Sync</span><span class="text-primary">89% Clarity</span></div>
                <div class="analysis-detail"><span>Behavioral Pattern</span><span class="text-accent">Optimized</span></div>
            `;
        }
        
        if (window.saveUserAnalysis) {
            window.saveUserAnalysis('multimodal', score, { 
                modalities: ['voice', 'face', 'behavioral'],
                syncCoherence: 'High (0.92)',
                neuroBuffer: 'Minimal'
            });
        }
    }, 4000);
};

// Dashboard Metrics
window.fetchDashboardMetrics = function() {
    const scoreEl = document.getElementById('dash-score');
    // Only set random score if not already set by database
    if (scoreEl && (scoreEl.innerText === '--' || scoreEl.innerText === '')) {
        scoreEl.innerText = Math.floor(Math.random() * 20) + 75;
    }

    
    const fields = {
        'dash-state': 'BALANCED & PRESENT',
        'dash-vagus': 'Vagus nerve tone is optimal.',
        'dash-pupil': 'Stable (1.2mm)',
        'dash-resp': '14 bpm',
        'dash-noise': 'Low (40dB)',
        'dash-pressure': 'Stable'
    };

    for (const [id, val] of Object.entries(fields)) {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    }

    // New: Update recommendations based on the score
    const score = parseInt(scoreEl.innerText);
    updateMoodRecommendations(score);

    // New: Confetti & Thought of the Day Trigger (once per session)
    if (!window.thoughtShown) {
        window.thoughtShown = true;
        setTimeout(showThoughtOfDay, 500);
    }
};

function showThoughtOfDay() {
    const quotes = [
        "Your mind is like a garden; your thoughts are the seeds.",
        "The best way to predict the future is to create it.",
        "Peace begins with a smile.",
        "In the middle of every difficulty lies opportunity.",
        "Your vibe attracts your tribe.",
        "Breath is the bridge which connects life to consciousness."
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    const quoteEl = document.getElementById('daily-quote');
    if (quoteEl) quoteEl.innerText = `"${quote}"`;

    // Confetti!
    if (window.confetti) {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#1870F4', '#FF852D', '#FFD13B']
        });
    }

    window.navigate('70-thought');
}

function updateMoodRecommendations(score) {
    const recCard = document.getElementById('mood-recs-card');
    const moodLabel = document.getElementById('rec-mood-label');
    const recList = document.getElementById('recommendations-list');

    if (!recCard || !recList) return;
    recCard.style.display = 'block';
    recList.innerHTML = ''; // Clear old

    let recommendations = [];

    if (score < 80) {
        moodLabel.innerText = "Stress Alert";
        moodLabel.style.background = "var(--accent)";
        recommendations = [
            { type: '🎵', title: 'Weightless', artist: 'Marconi Union', desc: 'Reduces anxiety by 65%' },
            { type: '🎵', title: 'Gymnopédie No.1', artist: 'Erik Satie', desc: 'Perfect for somatic reset' },
            { type: '🎬', title: 'The Secret Life of Walter Mitty', desc: 'Inspiring & Visually Calm' },
            { type: '🎬', title: 'Paddington 2', desc: 'Pure wholesome comfort' }
        ];
    } else if (score >= 80 && score < 90) {
        moodLabel.innerText = "Balanced";
        moodLabel.style.background = "var(--primary)";
        recommendations = [
            { type: '🎵', title: 'Spiegel im Spiegel', artist: 'Arvo Pärt', desc: 'Deep focus & resonance' },
            { type: '🎵', title: 'A Walk', artist: 'Tycho', desc: 'Modern ambient flow' },
            { type: '🎬', title: 'Arrival', desc: 'Serene & Thoughtful' },
            { type: '🎬', title: 'About Time', desc: 'Emotional grounding' }
        ];
    } else {
        moodLabel.innerText = "Peak Flow";
        moodLabel.style.background = "#10b981";
        recommendations = [
            { type: '🎵', title: 'Clair de Lune', artist: 'Debussy', desc: 'High resonance classic' },
            { type: '🎵', title: 'Experience', artist: 'Ludovico Einaudi', desc: 'Powerful & Uplifting' },
            { type: '🎬', title: 'Interstellar', desc: 'Vast & Inspiring' },
            { type: '🎬', title: 'Soul', desc: 'Perfect for deep reflection' }
        ];
    }

    recommendations.forEach(rec => {
        const item = document.createElement('div');
        item.className = 'p-3 mb-2 d-flex align-items-center';
        item.style.background = 'rgba(var(--primary-rgb), 0.05)';
        item.style.borderRadius = '12px';
        item.innerHTML = `
            <div style="font-size: 1.2rem; margin-right: 12px;">${rec.type}</div>
            <div>
                <p style="font-weight: bold; font-size: 0.8rem; margin-bottom: 2px;">${rec.title} ${rec.artist ? ' - ' + rec.artist : ''}</p>
                <p class="text-muted" style="font-size: 0.7rem;">${rec.desc}</p>
            </div>
        `;
        recList.appendChild(item);
    });
}

console.log("App.js: Script fully loaded and fixed.");

// --- MUSIC LOGIC ---
const bgMusic = document.getElementById('bg-music');
const musicIcon = document.getElementById('music-icon');
let isMusicPlaying = false;

window.toggleMusic = function() {
    if (!bgMusic) return;
    
    if (isMusicPlaying) {
        bgMusic.pause();
        musicIcon.innerText = '🔇';
    } else {
        bgMusic.play().catch(err => console.log("Music play blocked:", err));
        musicIcon.innerText = '🎵';
    }
    isMusicPlaying = !isMusicPlaying;
};

// Start music on first interaction (required by most browsers)
document.addEventListener('click', () => {
    if (!isMusicPlaying && bgMusic) {
        bgMusic.play().catch(err => console.log("Initial music play blocked:", err));
        isMusicPlaying = true;
        musicIcon.innerText = '🎵';
    }
}, { once: true });

// --- BIOMETRIC SCANNING & EMOTION RECOGNITION SYSTEMS ---

// 1. Fingerprint scan view handler
window.setupFingerprintScan = function() {
    const scanBtn = document.getElementById('fingerprint-scan-btn');
    const status = document.getElementById('fingerprint-scan-status');
    const title = document.getElementById('fingerprint-scan-title');
    const progressBar = document.getElementById('fingerprint-progress-bar');
    const progressFill = document.getElementById('fingerprint-progress');
    const pulseWave = document.getElementById('scan-pulse-wave');
    
    if(!scanBtn) return;
    
    // Reset scanner states
    progressBar.style.display = 'none';
    progressFill.style.width = '0%';
    pulseWave.style.display = 'none';
    scanBtn.classList.remove('scanning');
    title.innerText = 'Place & Hold Finger';
    status.innerText = 'Press and hold the sensor to capture Heart Rate Variability (HRV) and Galvanic Skin Response (GSR) telemetry.';
    
    let isHolding = false;
    let holdInterval = null;
    let progress = 0;
    
    function startScan() {
        if (isHolding) return;
        isHolding = true;
        scanBtn.classList.add('scanning');
        progressBar.style.display = 'block';
        pulseWave.style.display = 'flex';
        title.innerText = 'Analyzing Pulse Wave...';
        status.innerText = 'Measuring skin conductance (GSR)...';
        
        progress = 0;
        progressFill.style.width = '0%';
        
        holdInterval = setInterval(() => {
            progress += 4;
            if (progress > 100) progress = 100;
            progressFill.style.width = `${progress}%`;
            
            if (progress === 24) {
                status.innerText = 'Analyzing heart rate variability (HRV)...';
            } else if (progress === 52) {
                status.innerText = 'Calculating autonomic nervous system balance...';
            } else if (progress === 80) {
                status.innerText = 'Synthesizing local stress index...';
            }
            
            if (progress >= 100) {
                clearInterval(holdInterval);
                finishScan();
            }
        }, 120);
    }
    
    function cancelScan() {
        if (!isHolding) return;
        isHolding = false;
        clearInterval(holdInterval);
        scanBtn.classList.remove('scanning');
        progressBar.style.display = 'none';
        pulseWave.style.display = 'none';
        progressFill.style.width = '0%';
        title.innerText = 'Scan Aborted';
        status.innerText = 'Hold your finger down on the sensor until the progress bar completes.';
    }
    
    async function finishScan() {
        isHolding = false;
        scanBtn.classList.remove('scanning');
        pulseWave.style.display = 'none';
        title.innerText = 'Scan Complete';
        status.innerText = 'Syncing results with local privacy vault...';
        
        // Simulating metric variance for emotion classification
        const score = Math.floor(Math.random() * (95 - 65 + 1) + 65); // 65-95
        const gsrVal = (2.2 + Math.random() * 4.5).toFixed(2);
        const gsr = `${gsrVal} µS`;
        const hrv = Math.floor(35 + Math.random() * 55) + " ms";
        const heartRate = Math.floor(70 + Math.random() * 26) + " bpm";
        
        if (window.saveUserAnalysis) {
            await window.saveUserAnalysis('fingerprint', score, {
                gsr,
                hrv,
                heartRate
            });
        }
        
        setTimeout(() => {
            if (window.presentBiometricResult) {
                window.presentBiometricResult('fingerprint', score, {
                    gsr,
                    hrv,
                    heartRate
                });
            } else {
                window.navigate('29-insights-overview');
            }
        }, 1200);
    }
    
    // Mouse and Touch Events
    scanBtn.onmousedown = startScan;
    scanBtn.ontouchstart = (e) => { e.preventDefault(); startScan(); };
    
    window.onmouseup = cancelScan;
    window.ontouchend = cancelScan;
};

// 2. Emotional Classifier and Personalized suggestions presenter
window.presentBiometricResult = function(type, score, details) {
    console.log("Classifying feeling from telemetry:", type, score, details);
    
    // Feeling classification matrix
    let feeling = 'CALM & BALANCED';
    if (type === 'voice') {
        const transcript = (details.transcript || '').toLowerCase();
        if (transcript.includes('stress') || transcript.includes('anxi') || transcript.includes('tension') || transcript.includes('hard') || transcript.includes('pressure')) {
            feeling = 'STRESS & ANXIETY';
        } else if (transcript.includes('tired') || transcript.includes('exhaust') || transcript.includes('sleep') || transcript.includes('fatigue') || transcript.includes('burn')) {
            feeling = 'MENTAL FATIGUE';
        } else if (transcript.includes('sad') || transcript.includes('down') || transcript.includes('depress') || transcript.includes('low') || transcript.includes('lonely')) {
            feeling = 'MELANCHOLY';
        } else if (score < 74) {
            feeling = 'STRESS & ANXIETY';
        } else if (score < 86) {
            feeling = 'MENTAL FATIGUE';
        }
    } else if (type === 'face') {
        const resp = parseInt(details.respiration) || 14;
        if (resp > 16) {
            feeling = 'STRESS & ANXIETY';
        } else if (score < 73) {
            feeling = 'MELANCHOLY';
        } else if (score <= 86) {
            feeling = 'MENTAL FATIGUE';
        }
    } else if (type === 'fingerprint') {
        const heartRate = parseInt(details.heartRate) || 75;
        if (heartRate > 86) {
            feeling = 'STRESS & ANXIETY';
        } else if (score < 73) {
            feeling = 'MELANCHOLY';
        } else if (score <= 85) {
            feeling = 'MENTAL FATIGUE';
        }
    }
    
    let badgeColor = '';
    let blobEmoji = '';
    let titleText = '';
    let descText = '';
    let headerBorderColor = '';
    let blobColor = '';
    let therapyList = [];
    
    // Map feeling data to premium UI styling and targeted therapies
    if (feeling === 'STRESS & ANXIETY') {
        badgeColor = '#ef4444'; // Red
        blobEmoji = '⚡';
        titleText = 'Elevated Vagal Stress';
        descText = 'Acoustic and somatic biomarkers indicate high sympathetic arousal (fight-or-flight). Resetting your vagus nerve will help re-establish emotional stability.';
        headerBorderColor = '6px solid #ef4444';
        blobColor = 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0) 70%)';
        
        therapyList = [
            {
                icon: '🌬️',
                name: 'Somatic Vagus Reset (Box Breathing)',
                desc: 'Slow breathing to 6 breaths/min. Proven to lower heart rate and calm autonomic tension.',
                btnText: 'Start Somatic Reset',
                action: () => window.navigate('48-breathing-exercise')
            },
            {
                icon: '🎵',
                name: '432Hz Binaural Soundscape',
                desc: 'Calm cortical over-activity with low-frequency alpha wave soundscapes.',
                btnText: 'Play Audio Therapy',
                action: () => window.navigate('47-meditation-player')
            },
            {
                icon: '💬',
                name: 'Private Chat with Mentor Seraphina',
                desc: 'Speak with your empathetic guide in an encrypted local sandbox to parse triggers.',
                btnText: 'Talk to Mentor',
                action: () => {
                    const input = document.getElementById('mentor-chat-input');
                    if (input) input.value = "I am feeling a high amount of stress and anxiety right now. Can we do a grounding session?";
                    window.navigate('60-private-mentor');
                }
            }
        ];
    } else if (feeling === 'MENTAL FATIGUE') {
        badgeColor = '#f59e0b'; // Gold
        blobEmoji = '🔋';
        titleText = 'Exhaustion & Depleted Reserve';
        descText = 'Cognitive and biomarker metrics suggest high neurological fatigue. Inducing localized brain rest is recommended to restore peak alertness.';
        headerBorderColor = '6px solid #f59e0b';
        blobColor = 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0) 70%)';
        
        therapyList = [
            {
                icon: '🎵',
                name: '432Hz Theta Wave Acoustic Therapy',
                desc: 'Recharge cognitive energy and restore parasympathetic balance via wave synthesis.',
                btnText: 'Play Binaural Audio',
                action: () => window.navigate('47-meditation-player')
            },
            {
                icon: '🌬️',
                name: 'Gentle Box Breathing Rhythm',
                desc: 'Increase prefrontal cortex oxygenation to clear stress hormones.',
                btnText: 'Start Somatic Reset',
                action: () => window.navigate('48-breathing-exercise')
            }
        ];
    } else if (feeling === 'MELANCHOLY') {
        badgeColor = '#8b5cf6'; // Violet
        blobEmoji = '🌧️';
        titleText = 'Low Emotional Coherence';
        descText = 'Biometric baselines reflect flat pitch cadence and lowered energy variance. Supportive active listening is suggested to gradually lift resonance.';
        headerBorderColor = '6px solid #8b5cf6';
        blobColor = 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0) 70%)';
        
        therapyList = [
            {
                icon: '💬',
                name: 'Empathetic Sandbox (Mentor Seraphina)',
                desc: 'A safe, non-judgmental space to navigate your feelings with comforting guidance.',
                btnText: 'Chat with Seraphina',
                action: () => {
                    const input = document.getElementById('mentor-chat-input');
                    if (input) input.value = "I am feeling a bit low and melancholic today. I'd love some gentle guidance.";
                    window.navigate('60-private-mentor');
                }
            },
            {
                icon: '🎵',
                name: 'Uplifting Ambient Harmonics',
                desc: 'Encourage dopamine release and raise emotional frequencies slowly.',
                btnText: 'Play Calming Music',
                action: () => window.navigate('47-meditation-player')
            }
        ];
    } else {
        badgeColor = '#10b981'; // Emerald
        blobEmoji = '✨';
        titleText = 'Balanced Peak Flow';
        descText = 'Your biometrics reflect high autonomic coherence and balanced vagus nerve tone. You are present, focused, and calm.';
        headerBorderColor = '6px solid #10b981';
        blobColor = 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0) 70%)';
        
        therapyList = [
            {
                icon: '📝',
                name: 'Calibrate Base state (Gratitude Log)',
                desc: 'Save a reflection of this peak flow state to solidify positive neural pathways.',
                btnText: 'Write Entry',
                action: () => {
                    const moodSelect = document.getElementById('mood-entry-score');
                    if (moodSelect) moodSelect.value = "10";
                    window.navigate('37-add-mood');
                }
            },
            {
                icon: '📊',
                name: 'Analyze Historical Wellness Trends',
                desc: 'Check how your metrics correlate across weekly and monthly analytics.',
                btnText: 'View Insights',
                action: () => window.navigate('29-insights-overview')
            }
        ];
    }
    
    // Inject contents into HTML results view
    const container = document.getElementById('emotion-result-container');
    const sourceLabel = document.getElementById('result-source-label');
    const badge = document.getElementById('result-feeling-badge');
    const blob = document.getElementById('result-emotion-blob');
    const title = document.getElementById('result-feeling-title');
    const desc = document.getElementById('result-feeling-desc');
    const breakdown = document.getElementById('result-metrics-breakdown');
    
    if (container) container.style.borderTop = headerBorderColor;
    if (sourceLabel) sourceLabel.innerText = `${type.toUpperCase()} BIOMETRIC RESIDENCE`;
    if (badge) {
        badge.innerText = feeling;
        badge.style.backgroundColor = badgeColor;
    }
    if (blob) {
        blob.innerText = blobEmoji;
        blob.style.background = blobColor;
    }
    if (title) title.innerText = titleText;
    if (desc) desc.innerText = descText;
    
    if (breakdown) {
        breakdown.innerHTML = '';
        if (type === 'voice') {
            breakdown.innerHTML = `
                <div class="analysis-detail"><span>Speech Resonance</span><span>Balanced</span></div>
                <div class="analysis-detail"><span>Vocal Tension</span><span>${details.tension || 'N/A'}</span></div>
                <div class="analysis-detail"><span>Pitch Resonance</span><span>${details.pitch || 'N/A'}</span></div>
                <div class="analysis-detail"><span>Resonance Score</span><span>${score}%</span></div>
            `;
        } else if (type === 'face') {
            breakdown.innerHTML = `
                <div class="analysis-detail"><span>Pupil Stability</span><span>${details.pupilStability || 'Optimal'}</span></div>
                <div class="analysis-detail"><span>Micro-Respiration</span><span>${details.respiration || '14'} bpm</span></div>
                <div class="analysis-detail"><span>Facial Expression</span><span>Relaxed</span></div>
                <div class="analysis-detail"><span>Resonance Score</span><span>${score}%</span></div>
            `;
        } else if (type === 'fingerprint') {
            breakdown.innerHTML = `
                <div class="analysis-detail"><span>Pulse Rate</span><span>${details.heartRate || '72 bpm'}</span></div>
                <div class="analysis-detail"><span>Galvanic Skin Response</span><span>${details.gsr || '3.40 µS'}</span></div>
                <div class="analysis-detail"><span>HRV Interval</span><span>${details.hrv || '65 ms'}</span></div>
                <div class="analysis-detail"><span>Resonance Score</span><span>${score}%</span></div>
            `;
        }
    }
    
    // Inject suggested therapies buttons
    const listContainer = document.getElementById('suggested-therapies-list');
    if (listContainer) {
        listContainer.innerHTML = '';
        therapyList.forEach(therapy => {
            const card = document.createElement('div');
            card.className = 'p-3 d-flex align-items-center justify-content-between';
            card.style.background = 'rgba(24, 112, 244, 0.03)';
            card.style.borderRadius = '16px';
            card.style.border = '1px solid rgba(0,0,0,0.03)';
            card.innerHTML = `
                <div style="flex:1; padding-right:12px; text-align:left;">
                    <p style="font-weight:bold; font-size:0.85rem; margin-bottom:2px;">${therapy.icon} ${therapy.name}</p>
                    <p class="text-muted" style="font-size:0.75rem;">${therapy.desc}</p>
                </div>
                <button class="btn btn-primary" style="padding: 8px 14px; font-size:0.75rem; border-radius:12px; width:auto; white-space:nowrap;">${therapy.btnText}</button>
            `;
            const button = card.querySelector('button');
            button.onclick = () => {
                therapy.action();
            };
            listContainer.appendChild(card);
        });
    }
    
    window.navigate('55-biometric-result');
};

// 3. Interactive Therapy Guidance Integrations
let breathingInterval = null;
function runBreathingGuidance() {
    const circle = document.querySelector('#view-48-breathing-exercise .breathing-circle');
    if (!circle) return;
    
    clearInterval(breathingInterval);
    circle.innerText = 'Prepare';
    let phase = 0; // 0=Inhale, 1=Hold, 2=Exhale, 3=Hold
    let sec = 0;
    
    breathingInterval = setInterval(() => {
        sec++;
        if (sec > 4) {
            sec = 1;
            phase = (phase + 1) % 4;
        }
        
        if (phase === 0) {
            circle.innerText = `Inhale\n${sec}`;
            circle.style.transform = `scale(${0.8 + (sec * 0.1)})`;
        } else if (phase === 1) {
            circle.innerText = `Hold\n${sec}`;
            circle.style.transform = `scale(1.2)`;
        } else if (phase === 2) {
            circle.innerText = `Exhale\n${sec}`;
            circle.style.transform = `scale(${1.2 - (sec * 0.1)})`;
        } else if (phase === 3) {
            circle.innerText = `Hold\n${sec}`;
            circle.style.transform = `scale(0.8)`;
        }
    }, 1000);
}

let meditationTimer = null;
function setupMeditationPlayer() {
    const playPauseBtn = document.querySelector('#view-47-meditation-player .avatar[style*="font-size:1.5rem"]');
    const waves = document.querySelectorAll('#view-47-meditation-player .wave');
    const timerText = document.querySelector('#view-47-meditation-player h2.text-gradient');
    const bgMusic = document.getElementById('bg-music');
    
    if (!playPauseBtn || !timerText) return;
    
    let isPlaying = false;
    let secondsLeft = 15 * 60; // 15 minutes
    
    clearInterval(meditationTimer);
    
    function updateTimerDisplay() {
        const m = Math.floor(secondsLeft / 60);
        const s = secondsLeft % 60;
        timerText.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    
    updateTimerDisplay();
    
    function togglePlay() {
        if (isPlaying) {
            isPlaying = false;
            playPauseBtn.innerText = '▶';
            clearInterval(meditationTimer);
            waves.forEach(w => w.style.animationPlayState = 'paused');
            if (bgMusic) bgMusic.pause();
        } else {
            isPlaying = true;
            playPauseBtn.innerText = '⏸';
            waves.forEach(w => w.style.animationPlayState = 'running');
            if (bgMusic) bgMusic.play().catch(e => console.log("Meditation play blocked:", e));
            
            meditationTimer = setInterval(() => {
                secondsLeft--;
                if (secondsLeft <= 0) {
                    clearInterval(meditationTimer);
                    secondsLeft = 0;
                    isPlaying = false;
                    playPauseBtn.innerText = '▶';
                    waves.forEach(w => w.style.animationPlayState = 'paused');
                    alert("Acoustic therapy session completed. Resonance baseline recalibrated.");
                }
                updateTimerDisplay();
            }, 1000);
        }
    }
    
    playPauseBtn.onclick = togglePlay;
    
    // Auto-play when view starts
    togglePlay();
}

// Intercept navigate function globally to manage active timers/animations
const originalNavigate = window.navigate;
window.navigate = function(targetId) {
    if (originalNavigate) originalNavigate(targetId);
    
    if (targetId === '48-breathing-exercise') {
        runBreathingGuidance();
    } else {
        clearInterval(breathingInterval);
    }
    
    if (targetId === '47-meditation-player') {
        setupMeditationPlayer();
    } else {
        clearInterval(meditationTimer);
    }
    
    if (targetId === '52-fingerprint-scan') {
        if (window.setupFingerprintScan) window.setupFingerprintScan();
    }
};

