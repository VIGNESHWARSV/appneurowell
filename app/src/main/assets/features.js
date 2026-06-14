/**
 * NeuroWell AI — Advanced Features Engine (features.js)
 * Modules: Mood Forecast · Wellness Score · Voice Journal
 *          Burnout Detector · Wellness Planner · Music Therapy
 *          SOS Support · Emotional Analytics
 */

console.log("features.js: Advanced AI engine initializing...");

// ─── Utility Helpers ──────────────────────────────────────────────
function getLocalAnalysis() {
    try { return JSON.parse(localStorage.getItem('local_analysis_results') || '[]'); }
    catch(e) { return []; }
}
function getJournalEntries() {
    try { return JSON.parse(localStorage.getItem('nw_voice_journals') || '[]'); }
    catch(e) { return []; }
}
function saveJournalEntry(entry) {
    const entries = getJournalEntries();
    entries.unshift(entry);
    localStorage.setItem('nw_voice_journals', JSON.stringify(entries.slice(0, 50)));
}
function getDayLabel(offset) {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return days[d.getDay()];
}
function getDateStr(offset = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
}
function avgScore(data) {
    if (!data.length) return 72;
    return Math.round(data.reduce((s, r) => s + (r.score || 72), 0) / data.length);
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ─── 1. AI Mood Forecasting ───────────────────────────────────────
window.NW_MoodForecast = {
    generate(data) {
        // Use last 7 days avg as baseline, project forward with smooth drift
        const base = avgScore(data);
        const trend = data.length > 1
            ? (data[0].score - data[data.length - 1].score) / data.length
            : 0;

        const labels = ['Today','Tomorrow'];
        for (let i = 2; i <= 6; i++) labels.push(getDayLabel(i));

        return labels.map((label, i) => {
            const noise = (Math.sin(i * 2.3 + base) * 6) | 0;
            const drift = (trend * i * 0.4) | 0;
            const score = clamp(base + drift + noise, 45, 98);
            let emoji = '😊';
            if (score >= 88) emoji = '🌟';
            else if (score >= 80) emoji = '😊';
            else if (score >= 68) emoji = '😐';
            else if (score >= 55) emoji = '😔';
            else emoji = '😟';
            return { label, score, emoji, isToday: i === 0 };
        });
    },

    render(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const forecast = this.generate(data);
        const maxScore = Math.max(...forecast.map(f => f.score));

        container.innerHTML = forecast.map(f => {
            const heightPct = Math.round((f.score / maxScore) * 100);
            const color = f.isToday
                ? 'linear-gradient(135deg,#1870F4,#3682f6)'
                : f.score >= 80 ? 'rgba(24,112,244,0.5)'
                : f.score >= 65 ? 'rgba(245,158,11,0.6)'
                : 'rgba(239,68,68,0.5)';
            return `
                <div class="forecast-bar-wrap">
                    <div class="forecast-emoji">${f.emoji}</div>
                    <div class="forecast-bar${f.isToday?' today':''}"
                         data-val="${f.score}"
                         style="height:${heightPct}%;background:${color};">
                    </div>
                    <span class="forecast-bar-label">${f.label.substring(0,3)}</span>
                </div>`;
        }).join('');
    }
};

// ─── 2. Mental Wellness Score ─────────────────────────────────────
window.NW_WellnessScore = {
    calculate(data) {
        if (!data.length) return { score: 72, breakdown: this._defaultBreakdown(72) };

        const recent = data.slice(0, 10);
        const rawAvg = avgScore(recent);

        // Stability bonus: lower variance = more stable
        const variance = recent.length > 1
            ? recent.reduce((s,r) => s + Math.abs(r.score - rawAvg), 0) / recent.length
            : 0;
        const stabilityBonus = clamp(10 - variance * 0.5, -5, 10);

        // Frequency bonus: more entries = more engaged
        const freqBonus = clamp(recent.length * 1.5, 0, 10);

        const score = clamp(Math.round(rawAvg + stabilityBonus + freqBonus), 10, 100);
        return { score, breakdown: this._breakdown(score, variance, recent.length) };
    },

    _breakdown(score, variance, count) {
        return [
            { label: 'Mood Stability',     value: clamp(Math.round(100 - variance * 5), 40, 100), icon: '🧘' },
            { label: 'Stress Management',  value: clamp(score + 5, 40, 100),                       icon: '💆' },
            { label: 'Sleep Quality',      value: clamp(score - 8, 30, 100),                       icon: '🌙' },
            { label: 'Emotional Balance',  value: clamp(score + 3, 40, 100),                       icon: '⚖️' },
            { label: 'Activity Level',     value: clamp(count * 12, 10, 100),                      icon: '🏃' }
        ];
    },

    _defaultBreakdown(score) {
        return this._breakdown(score, 5, 3);
    },

    statusLabel(score) {
        if (score >= 85) return { text: 'Excellent', cls: 'excellent' };
        if (score >= 70) return { text: 'Good',      cls: 'good'      };
        if (score >= 55) return { text: 'Moderate',  cls: 'moderate'  };
        return               { text: 'Needs Care',  cls: 'low'       };
    },

    renderCircle(canvasId, score) {
        const el = document.getElementById(canvasId);
        if (!el) return;
        const radius = 68;
        const circ   = 2 * Math.PI * radius;
        const dash   = circ * (score / 100);
        const gap    = circ - dash;
        const color  = score >= 85 ? '#10b981' : score >= 70 ? '#1870F4' : score >= 55 ? '#f59e0b' : '#ef4444';

        el.innerHTML = `
            <div class="circular-progress">
                <svg viewBox="0 0 160 160">
                    <circle class="bg-circle" cx="80" cy="80" r="${radius}"/>
                    <circle class="score-circle"
                        cx="80" cy="80" r="${radius}"
                        stroke="${color}"
                        stroke-dasharray="${dash} ${gap}"
                        stroke-dashoffset="0"/>
                </svg>
                <div class="score-text">
                    <div class="score-number">${score}</div>
                    <span class="score-unit">/ 100</span>
                </div>
            </div>`;
    }
};

// ─── 3. Voice Journal & Emotional Analysis ────────────────────────
window.NW_VoiceJournal = {
    emotionFromText(text) {
        const t = text.toLowerCase();
        if (/(happy|joy|excit|great|wonderful|amazing|love|blessed)/.test(t))
            return { label: 'Joy', color: '#10b981', bg: 'rgba(16,185,129,0.12)', score: 88 };
        if (/(stress|anxi|worry|nervous|pressure|overwhelm)/.test(t))
            return { label: 'Anxious', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', score: 42 };
        if (/(sad|depress|lonely|hopeless|cry|down|blue)/.test(t))
            return { label: 'Sad', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', score: 35 };
        if (/(tired|exhaust|fatigue|sleep|burn|drain)/.test(t))
            return { label: 'Fatigued', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', score: 50 };
        if (/(angry|frustrat|annoy|irritat|mad)/.test(t))
            return { label: 'Frustrated', color: '#FF852D', bg: 'rgba(255,133,45,0.12)', score: 38 };
        if (/(calm|peaceful|relax|serene|content)/.test(t))
            return { label: 'Calm', color: '#1870F4', bg: 'rgba(24,112,244,0.12)', score: 82 };
        return { label: 'Neutral', color: '#666', bg: 'rgba(0,0,0,0.06)', score: 65 };
    },

    generateInsight(emotion, score, text) {
        const insights = {
            Joy:        `Your journal radiates positivity today! Capturing this state helps build your emotional resilience baseline. 🌟`,
            Anxious:    `Stress patterns detected in your journal. Consider a 5-minute breathing reset to recalibrate your nervous system. 🌬️`,
            Sad:        `It's completely valid to feel this way. Journaling is a powerful first step. Your NeuroWell mentor is here for you. 💙`,
            Fatigued:   `Your words reflect exhaustion. Prioritizing rest tonight will help restore your cognitive reserves significantly. 🌙`,
            Frustrated: `Frustration is a signal — your mind needs a release. A brief walk or breathing exercise can shift your neural state. 🏃`,
            Calm:       `Beautiful equilibrium in your words today. Your vagus nerve tone appears optimal. Keep this rhythm going! ✨`,
            Neutral:    `A steady, grounded entry today. Consistency in journaling builds powerful long-term emotional intelligence. 📖`
        };
        return insights[emotion.label] || insights['Neutral'];
    },

    saveEntry(text, emotion) {
        const entry = {
            id: Date.now().toString(),
            date: getDateStr(),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            text,
            emotion: emotion.label,
            emotionColor: emotion.color,
            emotionBg: emotion.bg,
            score: emotion.score,
            insight: this.generateInsight(emotion, emotion.score, text),
            timestamp: Date.now()
        };
        saveJournalEntry(entry);
        return entry;
    },

    renderEntries(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const entries = getJournalEntries();

        if (!entries.length) {
            container.innerHTML = `
                <div class="text-center" style="padding:40px 20px; color:var(--text-muted);">
                    <div style="font-size:2.5rem;margin-bottom:12px;">📖</div>
                    <p style="font-size:0.9rem;">No journal entries yet.<br>Tap the mic to record your first entry.</p>
                </div>`;
            return;
        }

        container.innerHTML = entries.map(e => `
            <div class="journal-entry-card" style="border-left-color:${e.emotionColor};">
                <div class="je-date">${e.date} · ${e.time || ''}</div>
                <div class="je-text">${e.text}</div>
                <span class="je-emotion" style="background:${e.emotionBg};color:${e.emotionColor};">${e.emotion}</span>
            </div>`).join('');
    }
};

// ─── 4. Burnout Detection Engine ──────────────────────────────────
window.NW_BurnoutDetector = {
    analyze(data) {
        if (!data.length) return { risk: 'Unknown', level: 0, factors: [], alert: false };

        const recent7 = data.slice(0, 7);
        const avgS = avgScore(recent7);

        // Declining trend check
        const trend = recent7.length > 2
            ? recent7[0].score - recent7[recent7.length - 1].score
            : 0;

        // Consecutive low scores
        const lowStreak = (() => {
            let streak = 0;
            for (const r of recent7) {
                if (r.score < 65) streak++;
                else break;
            }
            return streak;
        })();

        // Journal-based stress keyword analysis
        const journals = getJournalEntries().slice(0, 5);
        const stressKeywords = journals.filter(j =>
            /(stress|exhaust|tired|burn|overwhelm|anxi)/.test((j.text||'').toLowerCase())
        ).length;

        let riskScore = 0;
        riskScore += clamp((100 - avgS) * 0.5, 0, 30);
        riskScore += clamp(trend * 1.5, 0, 20);
        riskScore += lowStreak * 8;
        riskScore += stressKeywords * 5;
        riskScore = clamp(Math.round(riskScore), 0, 100);

        const factors = [];
        if (avgS < 65)       factors.push({ icon:'📉', text:'Consistently low wellness scores', severity:'high' });
        if (trend > 10)      factors.push({ icon:'⬇️', text:'Declining emotional trend detected', severity:'high' });
        if (lowStreak >= 3)  factors.push({ icon:'🔴', text:`${lowStreak} consecutive low-score days`, severity:'high' });
        if (stressKeywords>=2) factors.push({ icon:'💬', text:'Frequent stress language in journals', severity:'moderate' });
        if (avgS < 75)       factors.push({ icon:'😴', text:'Possible sleep quality impact', severity:'moderate' });
        if (!factors.length) factors.push({ icon:'✅', text:'No significant burnout indicators', severity:'low' });

        let risk, alert = false;
        if (riskScore >= 65)       { risk = 'High Risk';    alert = true; }
        else if (riskScore >= 40)  { risk = 'Moderate Risk'; }
        else if (riskScore >= 20)  { risk = 'Low Risk'; }
        else                       { risk = 'Minimal'; }

        return { risk, level: riskScore, factors, alert };
    },

    renderGauge(containerId, level) {
        const container = document.getElementById(containerId);
        if (!container) return;
        // Semicircle gauge: -90deg = 0%, 90deg = 100%
        const angle = -90 + (level / 100) * 180;
        const color = level >= 65 ? '#ef4444' : level >= 40 ? '#f59e0b' : '#10b981';

        container.innerHTML = `
            <div class="burnout-gauge">
                <svg viewBox="0 0 200 110">
                    <!-- Background arc -->
                    <path d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none" stroke="#f0f0f0" stroke-width="14" stroke-linecap="round"/>
                    <!-- Low zone -->
                    <path d="M 20 100 A 80 80 0 0 1 80 26"
                        fill="none" stroke="rgba(16,185,129,0.3)" stroke-width="14" stroke-linecap="round"/>
                    <!-- Moderate zone -->
                    <path d="M 80 26 A 80 80 0 0 1 140 26"
                        fill="none" stroke="rgba(245,158,11,0.3)" stroke-width="14" stroke-linecap="round"/>
                    <!-- High zone -->
                    <path d="M 140 26 A 80 80 0 0 1 180 100"
                        fill="none" stroke="rgba(239,68,68,0.3)" stroke-width="14" stroke-linecap="round"/>
                    <!-- Needle -->
                    <line id="burnout-needle-line" x1="100" y1="100" x2="100" y2="30"
                        stroke="${color}" stroke-width="3" stroke-linecap="round"
                        style="transform-origin:100px 100px; transform:rotate(${angle}deg); transition:transform 1.5s ease;"/>
                    <circle cx="100" cy="100" r="6" fill="${color}"/>
                    <!-- Score label -->
                    <text x="100" y="92" text-anchor="middle" font-size="11" fill="${color}" font-weight="700" font-family="Outfit,sans-serif">${level}%</text>
                </svg>
            </div>
            <div class="risk-zone-labels">
                <span style="color:#10b981">Low</span>
                <span style="color:#f59e0b">Moderate</span>
                <span style="color:#ef4444">High</span>
            </div>`;
    }
};

// ─── 5. Personalized Wellness Planner ────────────────────────────
window.NW_WellnessPlanner = {
    generate(score) {
        const slots = [];
        const h = new Date().getHours();

        // Morning block (if morning or showing full day)
        if (h < 10 || true) {
            slots.push({
                time: '7:00 AM', icon: '🌅', iconBg: 'rgba(245,158,11,0.12)',
                title: 'Morning Mindfulness', duration: '10 min',
                desc: 'Start with a 10-minute guided breathing session to set a calm baseline for the day.'
            });
        }

        if (score < 75) {
            slots.push({
                time: '9:30 AM', icon: '🧘', iconBg: 'rgba(24,112,244,0.12)',
                title: 'Stress Relief Meditation', duration: '15 min',
                desc: 'Focused meditation targeting cortisol reduction. Proven to lower stress by up to 30%.'
            });
        } else {
            slots.push({
                time: '9:30 AM', icon: '📝', iconBg: 'rgba(16,185,129,0.12)',
                title: 'Gratitude Journaling', duration: '10 min',
                desc: 'Log 3 positive observations to reinforce your current positive emotional state.'
            });
        }

        slots.push({
            time: '12:00 PM', icon: '🌬️', iconBg: 'rgba(139,92,246,0.12)',
            title: 'Midday Breathing Reset', duration: '5 min',
            desc: 'Box breathing (4-4-4-4) to reset your vagus nerve before the afternoon session.'
        });

        if (score < 65) {
            slots.push({
                time: '2:00 PM', icon: '🎵', iconBg: 'rgba(255,133,45,0.12)',
                title: '432Hz Acoustic Therapy', duration: '20 min',
                desc: 'Neural-acoustic soundscape to calm sympathetic overdrive and restore emotional balance.'
            });
        } else {
            slots.push({
                time: '2:00 PM', icon: '🚶', iconBg: 'rgba(20,184,166,0.12)',
                title: 'Movement Break', duration: '15 min',
                desc: 'A brisk walk or light stretching to boost endorphin levels and mental clarity.'
            });
        }

        slots.push({
            time: '6:00 PM', icon: '💬', iconBg: 'rgba(24,112,244,0.08)',
            title: 'Evening Reflection Journal', duration: '10 min',
            desc: 'Record today\'s emotional highlights to strengthen long-term self-awareness patterns.'
        });

        slots.push({
            time: '9:00 PM', icon: '🌙', iconBg: 'rgba(139,92,246,0.1)',
            title: 'Sleep Preparation Ritual', duration: '20 min',
            desc: 'Progressive muscle relaxation + 528Hz sleep soundscape for optimal REM cycle quality.'
        });

        return slots;
    },

    render(containerId, score) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const slots = this.generate(score);

        container.innerHTML = slots.map(s => `
            <div class="planner-slot">
                <div class="planner-time">${s.time}</div>
                <div class="planner-icon-wrap" style="background:${s.iconBg};">${s.icon}</div>
                <div class="planner-content">
                    <div class="pc-title">${s.title}</div>
                    <div class="pc-desc">${s.desc}</div>
                </div>
                <div class="planner-duration">${s.duration}</div>
            </div>`).join('');
    }
};

// ─── 6. Emotion-Based Music Therapy ──────────────────────────────
window.NW_MusicTherapy = {
    _playlists: {
        calm: {
            name: 'Calm & Serenity',
            subtitle: '432Hz · Theta Waves · Deep Calm',
            icon: '🎹',
            cls: 'mp-calm',
            tracks: ['Weightless — Marconi Union','Spiegel im Spiegel — Arvo Pärt','A Walk — Tycho','On The Nature of Daylight — Max Richter']
        },
        focus: {
            name: 'Deep Focus Flow',
            subtitle: 'Binaural Beats · Gamma · 40Hz',
            icon: '🧠',
            cls: 'mp-focus',
            tracks: ['Experience — Einaudi','Comptine d\'un autre été — Yann Tiersen','Time — Hans Zimmer','Arrival of the Birds — Cinematic Orchestra']
        },
        uplift: {
            name: 'Mood Uplift',
            subtitle: 'Serotonin Boost · Energizing',
            icon: '☀️',
            cls: 'mp-uplift',
            tracks: ['Happy — Pharrell Williams','Here Comes the Sun — The Beatles','Walking on Sunshine — Katrina','Shake It Out — Florence & The Machine']
        },
        sleep: {
            name: 'Sleep & Recovery',
            subtitle: 'Delta Waves · 528Hz · Melatonin Boost',
            icon: '🌙',
            cls: 'mp-sleep',
            tracks: ['Clair de Lune — Debussy','Sleep — Max Richter','Gymnopédie No.1 — Satie','Nuvole Bianche — Einaudi']
        },
        energize: {
            name: 'Morning Energy',
            subtitle: 'Beta Waves · Dopamine Release',
            icon: '⚡',
            cls: 'mp-energize',
            tracks: ['Feeling Good — Nina Simone','Eye of the Tiger — Survivor','Lose Yourself — Eminem','Don\'t Stop Me Now — Queen']
        }
    },

    recommend(score) {
        if (score >= 85) return ['focus', 'uplift', 'energize'];
        if (score >= 70) return ['calm', 'focus', 'uplift'];
        if (score >= 55) return ['calm', 'sleep', 'focus'];
        return ['calm', 'sleep', 'uplift'];
    },

    render(containerId, score) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const keys = this.recommend(score);

        container.innerHTML = keys.map(key => {
            const pl = this._playlists[key];
            return `
                <div class="music-playlist-card ${pl.cls}" onclick="NW_MusicTherapy.playPlaylist('${key}')">
                    <div class="mp-cover">${pl.icon}</div>
                    <div class="mp-info">
                        <div class="mp-title">${pl.name}</div>
                        <div class="mp-sub">${pl.subtitle}</div>
                    </div>
                    <button class="mp-play" onclick="event.stopPropagation();NW_MusicTherapy.playPlaylist('${key}')">▶</button>
                </div>`;
        }).join('');
    },

    playPlaylist(key) {
        const pl = this._playlists[key];
        if (!pl) return;
        const track = pl.tracks[Math.floor(Math.random() * pl.tracks.length)];
        // Update meditation player view with context
        const playerView = document.getElementById('view-47-meditation-player');
        if (playerView) {
            const titleEl = playerView.querySelector('h3');
            const subEl   = playerView.querySelector('p.text-muted');
            if (titleEl) titleEl.innerText = pl.name;
            if (subEl)   subEl.innerText   = `Now Playing: ${track}`;
        }
        window.navigate('47-meditation-player');
    },

    renderAll(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const keys = Object.keys(this._playlists);

        container.innerHTML = keys.map(key => {
            const pl = this._playlists[key];
            return `
                <div class="music-playlist-card ${pl.cls}" onclick="NW_MusicTherapy.playPlaylist('${key}')">
                    <div class="mp-cover">${pl.icon}</div>
                    <div class="mp-info">
                        <div class="mp-title">${pl.name}</div>
                        <div class="mp-sub">${pl.subtitle}</div>
                    </div>
                    <button class="mp-play" onclick="event.stopPropagation();NW_MusicTherapy.playPlaylist('${key}')">▶</button>
                </div>`;
        }).join('');
    }
};

// ─── 7. Emergency SOS & Crisis Support ───────────────────────────
window.NW_SOS = {
    resources: [
        { icon:'📞', iconBg:'rgba(239,68,68,0.1)',  title:'Crisis Helpline',         sub:'NIMHANS: 080-46110007 · iCall: 9152987821',  action:'tel:08046110007' },
        { icon:'💬', iconBg:'rgba(24,112,244,0.1)',  title:'Talk to AI Mentor',       sub:'Immediate empathetic support',                action:'navigate:60-private-mentor' },
        { icon:'🌬️', iconBg:'rgba(16,185,129,0.1)', title:'Emergency Breathing',     sub:'4-7-8 technique · Activates vagus nerve',     action:'navigate:48-breathing-exercise' },
        { icon:'🎵', iconBg:'rgba(139,92,246,0.1)', title:'Calming Soundscape',      sub:'432Hz theta waves · Instant relaxation',      action:'navigate:47-meditation-player' },
        { icon:'🏥', iconBg:'rgba(245,158,11,0.1)', title:'Find Nearby Help',        sub:'Mental health professionals near you',         action:'url:https://www.google.com/maps/search/mental+health+services' },
        { icon:'📋', iconBg:'rgba(20,184,166,0.1)', title:'Safety Plan Checklist',   sub:'Step-by-step crisis management guide',         action:'navigate:77-sos-support' }
    ],

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = this.resources.map(r => `
            <div class="sos-resource-card" onclick="NW_SOS.handleAction('${r.action}')">
                <div class="sr-icon" style="background:${r.iconBg};">${r.icon}</div>
                <div class="sr-info">
                    <div class="sr-title">${r.title}</div>
                    <div class="sr-sub">${r.sub}</div>
                </div>
                <span class="sr-action">›</span>
            </div>`).join('');
    },

    handleAction(action) {
        if (action.startsWith('navigate:')) {
            window.navigate(action.split(':')[1]);
        } else if (action.startsWith('tel:')) {
            window.location.href = action;
        } else if (action.startsWith('url:')) {
            window.open(action.split('url:')[1], '_blank');
        }
    },

    checkAndAlert(score) {
        const fab = document.getElementById('sos-fab');
        if (!fab) return;
        // Show SOS button when score is low
        fab.style.display = (score < 50) ? 'flex' : 'none';
    }
};

// ─── 8. Emotional Analytics Dashboard ────────────────────────────
window.NW_Analytics = {
    compute(data) {
        if (!data.length) return this._defaults();
        const scores = data.map(d => d.score || 72);
        const avg    = Math.round(scores.reduce((a,b) => a+b, 0) / scores.length);
        const max    = Math.max(...scores);
        const min    = Math.min(...scores);
        const range  = max - min;

        // Mood trend (simple linear regression slope)
        const n = scores.length;
        const xMean = (n - 1) / 2;
        const yMean = avg;
        const slope = scores.reduce((s, y, i) => s + (i - xMean) * (y - yMean), 0)
                    / scores.reduce((s, _, i) => s + Math.pow(i - xMean, 2), 0.001);

        // Burnout risk from detector
        const burnout = NW_BurnoutDetector.analyze(data);

        // Weekly vs this week comparison
        const thisWeekData = data.filter(d => {
            const diff = (Date.now() - (d.timestamp || 0)) / 86400000;
            return diff <= 7;
        });
        const lastWeekData = data.filter(d => {
            const diff = (Date.now() - (d.timestamp || 0)) / 86400000;
            return diff > 7 && diff <= 14;
        });
        const thisAvg = avgScore(thisWeekData);
        const lastAvg = avgScore(lastWeekData);
        const change  = lastAvg ? Math.round(((thisAvg - lastAvg) / lastAvg) * 100) : 0;

        return {
            avg, max, min, range,
            slope: Math.round(slope * 100) / 100,
            trend: slope > 0.5 ? 'Improving' : slope < -0.5 ? 'Declining' : 'Stable',
            burnoutRisk: burnout.risk,
            burnoutLevel: burnout.level,
            weeklyChange: change,
            totalSessions: data.length,
            insights: this._generateInsights(avg, slope, burnout.level, range)
        };
    },

    _generateInsights(avg, slope, burnoutLevel, range) {
        const list = [];
        if (avg >= 80)       list.push({ icon:'🌟', text:'Your average wellness score is excellent this period.', color:'#10b981' });
        if (slope > 0.5)     list.push({ icon:'📈', text:'Positive upward trend — your wellness is improving!', color:'#1870F4' });
        if (slope < -0.5)    list.push({ icon:'📉', text:'A declining trend detected — consider increasing self-care activities.', color:'#ef4444' });
        if (burnoutLevel>60) list.push({ icon:'🔥', text:'Burnout risk is elevated. Prioritize rest and recovery this week.', color:'#ef4444' });
        if (range > 30)      list.push({ icon:'📊', text:'High score variance suggests emotional instability. Aim for consistent routines.', color:'#f59e0b' });
        if (range < 10)      list.push({ icon:'⚖️', text:'Excellent emotional stability — your mood is very consistent!', color:'#10b981' });
        if (!list.length)    list.push({ icon:'😊', text:'Your emotional health is in a balanced, healthy range.', color:'#1870F4' });
        return list;
    },

    _defaults() {
        return {
            avg: 72, max: 85, min: 58, range: 27, slope: 0, trend: 'Stable',
            burnoutRisk: 'Low Risk', burnoutLevel: 25, weeklyChange: 0, totalSessions: 0,
            insights: [{ icon:'📖', text:'Complete a few mood analyses to unlock your personal analytics.', color:'#1870F4' }]
        };
    },

    renderMetrics(containerId, stats) {
        const el = document.getElementById(containerId);
        if (!el) return;
        const changeColor = stats.weeklyChange >= 0 ? '#10b981' : '#ef4444';
        const changePfx   = stats.weeklyChange >= 0 ? '+' : '';
        el.innerHTML = `
            <div class="metric-row"><span class="mr-label">Average Score</span><span class="mr-value">${stats.avg} / 100</span></div>
            <div class="metric-row"><span class="mr-label">Peak Score</span><span class="mr-value" style="color:#10b981">${stats.max}</span></div>
            <div class="metric-row"><span class="mr-label">Lowest Score</span><span class="mr-value" style="color:#ef4444">${stats.min}</span></div>
            <div class="metric-row"><span class="mr-label">Trend</span><span class="mr-value">${stats.trend}</span></div>
            <div class="metric-row"><span class="mr-label">Burnout Risk</span><span class="mr-value" style="color:${stats.burnoutLevel>=65?'#ef4444':stats.burnoutLevel>=40?'#f59e0b':'#10b981'}">${stats.burnoutRisk}</span></div>
            <div class="metric-row"><span class="mr-label">Weekly Change</span><span class="mr-value" style="color:${changeColor}">${changePfx}${stats.weeklyChange}%</span></div>
            <div class="metric-row"><span class="mr-label">Total Sessions</span><span class="mr-value">${stats.totalSessions}</span></div>`;
    },

    renderInsights(containerId, stats) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = stats.insights.map(i => `
            <div class="glass-card mb-3" style="border-left:4px solid ${i.color}; padding:14px;">
                <p style="font-size:0.85rem;line-height:1.5;"><span style="margin-right:8px;">${i.icon}</span>${i.text}</p>
            </div>`).join('');
    },

    renderBarChart(containerId, data, label) {
        const el = document.getElementById(containerId);
        if (!el) return;
        const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const today = new Date();
        const last7 = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(today.getDate() - i);
            last7.push(d.toISOString().split('T')[0]);
        }

        el.innerHTML = `
            <div style="display:flex;align-items:flex-end;gap:6px;height:120px;margin-bottom:8px;">
            ${last7.map((dateStr, idx) => {
                const dayData = data.filter(r => r.date === dateStr);
                const score   = dayData.length ? avgScore(dayData) : 0;
                const h       = score ? Math.max(8, Math.round((score / 100) * 120)) : 8;
                const isToday = idx === 6;
                const color   = isToday ? 'var(--primary-gradient)' : 'rgba(24,112,244,0.35)';
                const d       = new Date(dateStr);
                return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
                    <div style="width:100%;height:${h}px;background:${color};border-radius:6px 6px 3px 3px;"></div>
                    <span style="font-size:0.65rem;font-weight:600;color:${isToday?'var(--primary)':'var(--text-muted)'}">${days[d.getDay()][0]}</span>
                </div>`;
            }).join('')}
            </div>`;
    }
};

// ─── Dashboard Feature Cards Renderer ─────────────────────────────
window.NW_renderDashboardCards = function() {
    const container = document.getElementById('nw-feature-grid');
    if (!container) return;
    const data = getLocalAnalysis();
    const score = avgScore(data);
    const burnout = NW_BurnoutDetector.analyze(data);
    const ws = NW_WellnessScore.calculate(data);
    const status = NW_WellnessScore.statusLabel(ws.score);

    container.innerHTML = `
        <div class="feature-card fc-green" onclick="window.navigate('72-wellness-score')">
            <div class="fc-icon">🧠</div>
            <div class="fc-title">Wellness Score</div>
            <div class="fc-value" style="color:${ws.score>=85?'#10b981':ws.score>=70?'#1870F4':'#f59e0b'};font-weight:700;">${ws.score} — ${status.text}</div>
        </div>
        <div class="feature-card fc-blue" onclick="window.navigate('71-mood-forecast')">
            <div class="fc-icon">🔮</div>
            <div class="fc-title">Mood Forecast</div>
            <div class="fc-value">7-day prediction</div>
        </div>
        <div class="feature-card fc-amber" onclick="window.navigate('74-burnout-detector')">
            <div class="fc-icon">🔥</div>
            <div class="fc-title">Burnout Risk</div>
            <div class="fc-value" style="color:${burnout.level>=65?'#ef4444':burnout.level>=40?'#f59e0b':'#10b981'};font-weight:700;">${burnout.risk}</div>
        </div>
        <div class="feature-card fc-purple" onclick="window.navigate('75-wellness-planner')">
            <div class="fc-icon">📋</div>
            <div class="fc-title">Daily Planner</div>
            <div class="fc-value">AI-generated today</div>
        </div>
        <div class="feature-card fc-teal" onclick="window.navigate('73-voice-journal')">
            <div class="fc-icon">🎙️</div>
            <div class="fc-title">Voice Journal</div>
            <div class="fc-value">${getJournalEntries().length} entries</div>
        </div>
        <div class="feature-card fc-red" onclick="window.navigate('76-music-therapy')">
            <div class="fc-icon">🎵</div>
            <div class="fc-title">Music Therapy</div>
            <div class="fc-value">Emotion-matched</div>
        </div>`;

    // Update SOS visibility
    NW_SOS.checkAndAlert(score);
};

// ─── Initialize all features on navigate ─────────────────────────
window.NW_initView = function(viewId) {
    const data = getLocalAnalysis();
    const score = avgScore(data);

    switch(viewId) {
        case '71-mood-forecast':
            NW_MoodForecast.render('forecast-chart-container', data);
            break;

        case '72-wellness-score':
            const ws = NW_WellnessScore.calculate(data);
            NW_WellnessScore.renderCircle('wellness-circle-container', ws.score);
            const badge = document.getElementById('wellness-status-badge');
            const status = NW_WellnessScore.statusLabel(ws.score);
            if (badge) { badge.textContent = status.text; badge.className = `wellness-status-badge ${status.cls}`; }
            const breakdown = document.getElementById('wellness-breakdown');
            if (breakdown && ws.breakdown) {
                breakdown.innerHTML = ws.breakdown.map(b => `
                    <div class="metric-row">
                        <span class="mr-label">${b.icon} ${b.label}</span>
                        <div style="display:flex;align-items:center;gap:10px;">
                            <div style="width:80px;height:6px;background:#f0f0f0;border-radius:3px;overflow:hidden;">
                                <div style="width:${b.value}%;height:100%;background:var(--primary);border-radius:3px;transition:width 1s;"></div>
                            </div>
                            <span class="mr-value" style="min-width:32px;">${b.value}</span>
                        </div>
                    </div>`).join('');
            }
            const summary = document.getElementById('wellness-summary-text');
            if (summary) {
                summary.textContent = ws.score >= 85
                    ? 'Your mental wellness is flourishing! Keep up your current routines.'
                    : ws.score >= 70
                    ? 'Your wellness is in a healthy range. Small daily habits will continue to improve your score.'
                    : ws.score >= 55
                    ? 'There is room for improvement. Focus on sleep quality and stress reduction this week.'
                    : 'Your wellness needs attention. Please explore the recommended therapies below.';
            }
            break;

        case '73-voice-journal':
            NW_VoiceJournal.renderEntries('journal-entries-list');
            NW_VoiceJournal._initRecording();
            break;

        case '74-burnout-detector':
            const burnout = NW_BurnoutDetector.analyze(data);
            NW_BurnoutDetector.renderGauge('burnout-gauge-container', burnout.level);
            const riskEl = document.getElementById('burnout-risk-label');
            if (riskEl) {
                riskEl.textContent = burnout.risk;
                const color = burnout.level>=65?'#ef4444':burnout.level>=40?'#f59e0b':'#10b981';
                riskEl.style.color = color;
            }
            const factorsEl = document.getElementById('burnout-factors-list');
            if (factorsEl) {
                factorsEl.innerHTML = burnout.factors.map(f => `
                    <div style="display:flex;align-items:flex-start;gap:10px;padding:10px;background:${f.severity==='high'?'rgba(239,68,68,0.06)':f.severity==='moderate'?'rgba(245,158,11,0.06)':'rgba(16,185,129,0.06)'};border-radius:12px;margin-bottom:8px;">
                        <span style="font-size:1.1rem;">${f.icon}</span>
                        <span style="font-size:0.82rem;color:var(--text-main);line-height:1.4;">${f.text}</span>
                    </div>`).join('');
            }
            if (burnout.alert) {
                const alertBanner = document.getElementById('burnout-alert-banner');
                if (alertBanner) alertBanner.style.display = 'block';
            }
            break;

        case '75-wellness-planner':
            NW_WellnessPlanner.render('planner-slots-container', score);
            const plannerScore = document.getElementById('planner-wellness-score');
            if (plannerScore) plannerScore.textContent = score;
            break;

        case '76-music-therapy':
            NW_MusicTherapy.render('music-recommended-list', score);
            NW_MusicTherapy.renderAll('music-all-list');
            const moodEl = document.getElementById('music-mood-label');
            if (moodEl) {
                moodEl.textContent = score >= 85 ? 'Peak Flow' : score >= 70 ? 'Balanced' : score >= 55 ? 'Moderate' : 'Low Energy';
            }
            break;

        case '77-sos-support':
            NW_SOS.render('sos-resources-list');
            break;

        case '78-emotional-analytics':
            const stats = NW_Analytics.compute(data);
            NW_Analytics.renderMetrics('analytics-metrics-container', stats);
            NW_Analytics.renderInsights('analytics-insights-container', stats);
            NW_Analytics.renderBarChart('analytics-bar-chart', data, 'Wellness Score');
            const trendEl = document.getElementById('analytics-trend-badge');
            if (trendEl) {
                const color = stats.trend==='Improving'?'#10b981':stats.trend==='Declining'?'#ef4444':'#1870F4';
                trendEl.textContent = stats.trend;
                trendEl.style.color = color;
            }
            break;

        case '16-dashboard-main':
            NW_renderDashboardCards();
            break;

        case '29-insights-overview':
            // Update insights overview with real analytics link cards
            break;
    }
};

// ─── Voice Journal Internal Recording ─────────────────────────────
window.NW_VoiceJournal._initRecording = function() {
    const btn       = document.getElementById('journal-record-btn');
    const statusEl  = document.getElementById('journal-record-status');
    const transcript= document.getElementById('journal-transcript-display');
    const emotionEl = document.getElementById('journal-emotion-result');
    const insightEl = document.getElementById('journal-insight-text');
    const saveBtn   = document.getElementById('journal-save-btn');
    let currentText = '';
    let isRecording = false;
    let recognition = null;

    if (!btn) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    function startRecording() {
        if (isRecording) return stopRecording();
        isRecording = true;
        btn.classList.add('recording');
        btn.innerHTML = '⏹';
        if (statusEl) statusEl.textContent = 'Recording... tap to stop';

        if (SpeechRecognition) {
            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.onresult = e => {
                currentText = Array.from(e.results).map(r => r[0].transcript).join(' ');
                if (transcript) transcript.textContent = `"${currentText}"`;
            };
            recognition.onerror = () => useFallback();
            try { recognition.start(); } catch(e) { useFallback(); }
        } else {
            useFallback();
        }
    }

    function stopRecording() {
        isRecording = false;
        btn.classList.remove('recording');
        btn.innerHTML = '🎙';
        if (recognition) try { recognition.stop(); } catch(e) {}
        if (!currentText) currentText = "I've been reflecting on my day and how I feel right now.";
        analyzeEntry(currentText);
    }

    function useFallback() {
        if (statusEl) statusEl.textContent = 'Simulating recording...';
        setTimeout(() => {
            currentText = "Today has been a mix of emotions. I feel somewhat stressed but also hopeful about the progress I am making.";
            if (transcript) transcript.textContent = `"${currentText}"`;
            stopRecording();
        }, 2500);
    }

    function analyzeEntry(text) {
        if (statusEl) statusEl.textContent = '✨ Analyzing emotional patterns...';
        setTimeout(() => {
            const emotion = NW_VoiceJournal.emotionFromText(text);
            const insight = NW_VoiceJournal.generateInsight(emotion, emotion.score, text);
            if (emotionEl) {
                emotionEl.style.display = 'block';
                emotionEl.innerHTML = `
                    <div style="display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:20px;background:${emotion.bg};margin-bottom:10px;">
                        <span style="font-weight:700;color:${emotion.color};font-size:0.9rem;">${emotion.label}</span>
                        <span style="font-size:0.75rem;color:var(--text-muted);">Score: ${emotion.score}/100</span>
                    </div>`;
            }
            if (insightEl) {
                insightEl.style.display = 'block';
                insightEl.textContent = insight;
            }
            if (saveBtn) saveBtn.style.display = 'block';
            if (statusEl) statusEl.textContent = 'Analysis complete — save your entry below.';
            window._pendingJournalText  = text;
            window._pendingJournalEmotion = emotion;
        }, 1500);
    }

    btn.onclick = startRecording;

    if (saveBtn) {
        saveBtn.onclick = () => {
            if (!window._pendingJournalText) return;
            const entry = NW_VoiceJournal.saveEntry(window._pendingJournalText, window._pendingJournalEmotion);
            if (window.saveUserAnalysis) window.saveUserAnalysis('voice_journal', entry.score, { emotion: entry.emotion });
            window._pendingJournalText = null;
            window._pendingJournalEmotion = null;
            // Reset UI
            if (transcript)  transcript.textContent = '';
            if (emotionEl)   emotionEl.style.display = 'none';
            if (insightEl)   insightEl.style.display = 'none';
            if (saveBtn)     saveBtn.style.display = 'none';
            if (statusEl)    statusEl.textContent = 'Entry saved! ✓';
            NW_VoiceJournal.renderEntries('journal-entries-list');
            setTimeout(() => { if (statusEl) statusEl.textContent = 'Tap the mic to record'; }, 2000);
        };
    }
};

// ─── Hook into existing navigate function ────────────────────────
(function patchNavigate() {
    const orig = window.navigate;
    window.navigate = function(targetId) {
        orig(targetId);
        setTimeout(() => NW_initView(targetId), 100);
    };
})();

// ─── Analytics tab switching ─────────────────────────────────────
window.NW_switchAnalyticsTab = function(period) {
    document.querySelectorAll('.analytics-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.period === period);
    });
    const data = getLocalAnalysis();
    const filterDays = period === 'weekly' ? 7 : period === 'monthly' ? 30 : 90;
    const filtered = data.filter(d => {
        const diff = (Date.now() - (d.timestamp || 0)) / 86400000;
        return diff <= filterDays;
    });
    const stats = NW_Analytics.compute(filtered);
    NW_Analytics.renderMetrics('analytics-metrics-container', stats);
    NW_Analytics.renderInsights('analytics-insights-container', stats);
    NW_Analytics.renderBarChart('analytics-bar-chart', filtered, 'Score');
};

// Initial run if dashboard already visible
document.addEventListener('DOMContentLoaded', () => {
    const active = document.querySelector('.view.active');
    if (active) {
        const id = active.id.replace('view-','');
        setTimeout(() => NW_initView(id), 300);
    }
});

console.log("features.js: All 8 AI wellness engines ready ✓");
