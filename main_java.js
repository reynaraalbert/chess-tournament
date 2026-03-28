const toastEl = document.getElementById('toast');
const greetingEl = document.getElementById('greeting');
const subTextEl = document.getElementById('subText');

function showToast(message, type = 'info') {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.className = `toast show ${type}`;

    clearTimeout(toastEl._hideTimeout);
    toastEl._hideTimeout = setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3200);
}

function getTimeGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

function setGreeting(user) {
    if (!greetingEl || !subTextEl) return;
    const baseGreeting = `${getTimeGreeting()}, ${user}`;
    greetingEl.textContent = `${baseGreeting}! Ready for your next move?`;
    subTextEl.textContent = 'Choose an action to keep improving your game.';
}

function setupActionButtons() {
    const actions = [
        {
            selector: '.action-grid .action-card:nth-child(1) .action-btn',
            message: 'Matchmaking started... good luck!',
            type: 'success',
            href: 'play.html'
        },
        {
            selector: '.action-grid .action-card:nth-child(3) .action-btn',
            message: 'Opening Leaderboard...',
            type: 'success',
            href: 'leaderboard.html'
        }
    ];

    actions.forEach((action) => {
        const btn = document.querySelector(action.selector);
        if (!btn) return;
        btn.addEventListener('click', () => {
            showToast(action.message, action.type);
            if (action.href) {
                setTimeout(() => {
                    window.location.href = action.href;
                }, 800);
            }
        });
    });

    // Tournament button handled separately
    const tournamentBtn = document.getElementById('tournamentBtn');
    if (tournamentBtn) {
        tournamentBtn.addEventListener('click', openTournamentModal);
    }
}

// ───────────── Options Dropdown ─────────────
function toggleOptions(e) {
    e.stopPropagation();
    const dropdown = document.getElementById('optionsDropdown');
    dropdown.classList.toggle('open');
}

// Close dropdown when clicking anywhere else
document.addEventListener('click', () => {
    const dropdown = document.getElementById('optionsDropdown');
    if (dropdown) dropdown.classList.remove('open');
});

// ───────────── Stats Modal ─────────────
// ───────────── Tier System ─────────────
const TIERS = [
    { key: 'unranked',   name: 'Unranked',          icon: '⬜', min: 0    },
    { key: 'beginner',   name: 'Beginner',           icon: '🔵', min: 300  },
    { key: 'elementary', name: 'Elementary',         icon: '🟢', min: 1000 },
    { key: 'bronze',     name: 'Bronze',             icon: '🥉', min: 1500 },
    { key: 'silver',     name: 'Silver',             icon: '🥈', min: 2000 },
    { key: 'gold',       name: 'Gold',               icon: '🥇', min: 2500 },
    { key: 'platinum',   name: 'Platinum',           icon: '🪙', min: 3000 },
    { key: 'diamond',    name: 'Diamond',            icon: '💎', min: 3500 },
    { key: 'ace',        name: 'Ace',                icon: '🌟', min: 4000 },
    { key: 'conqueror',  name: 'Conqueror',          icon: '👑', min: 4500 },
    { key: 'god',        name: 'God of the Game',    icon: '🔱', min: 5000 },
];

function getTier(pts) {
    for (let i = TIERS.length - 1; i >= 0; i--) {
        if (pts >= TIERS[i].min) return TIERS[i];
    }
    return TIERS[0];
}

// ───────────── Stats Modal ─────────────
function showStats() {
    document.getElementById('optionsDropdown').classList.remove('open');

    const username = localStorage.getItem('currentUser') || 'Unknown';
    const ptsRaw = localStorage.getItem('userPoints');  // null if never played
    const registeredRaw = localStorage.getItem('registeredTournaments');
    const registered = registeredRaw ? JSON.parse(registeredRaw) : [];

    let ptsDisplay = '—';
    let rankDisplay = '⬜ Unranked';
    let activeTierKey = 'unranked';

    if (ptsRaw !== null) {
        const pts = parseInt(ptsRaw);
        const tier = getTier(pts);
        ptsDisplay = `${pts} pts`;
        rankDisplay = `${tier.icon} ${tier.name}`;
        activeTierKey = tier.key;
    }

    document.getElementById('statUsername').textContent = username;
    document.getElementById('statElo').textContent = ptsDisplay;
    document.getElementById('statRank').textContent = rankDisplay;
    document.getElementById('statTournaments').textContent = registered.length;

    // Highlight active tier in tier cards (dashboard section)
    highlightTierCards(activeTierKey);

    openModal('statsModal');
}

// ───────────── Delete Account ─────────────
function deleteAccount() {
    document.getElementById('optionsDropdown').classList.remove('open');

    const username = localStorage.getItem('currentUser') || 'your account';
    if (confirm(`Are you sure you want to permanently delete "${username}"? This cannot be undone.`)) {
        // Remove this user from the chessTourUsers registry
        const usersRaw = localStorage.getItem('chessTourUsers');
        if (usersRaw) {
            const users = JSON.parse(usersRaw);
            delete users[username];
            localStorage.setItem('chessTourUsers', JSON.stringify(users));
        }
        // Clear session data
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userElo');
        localStorage.removeItem('registeredTournaments');
        window.location.href = 'index.html';
    }
}

// ───────────── Tournament Register Modal ─────────────
function openTournamentModal() {
    // Reset radio selection
    document.querySelectorAll('input[name="tournament"]').forEach(r => r.checked = false);
    document.querySelectorAll('.tournament-option').forEach(o => o.classList.remove('selected'));
    openModal('tournamentModal');
}

function confirmTournamentRegister() {
    const selected = document.querySelector('input[name="tournament"]:checked');
    if (!selected) {
        showToast('Please select a tournament first!', 'error');
        return;
    }

    const tournamentName = selected.value;

    // Check if already registered
    const raw = localStorage.getItem('registeredTournaments');
    const registrations = raw ? JSON.parse(raw) : [];

    if (registrations.includes(tournamentName)) {
        showToast(`You're already registered for ${tournamentName}!`, 'error');
        return;
    }

    registrations.push(tournamentName);
    localStorage.setItem('registeredTournaments', JSON.stringify(registrations));

    closeModal('tournamentModal');
    showToast(`✅ Registered for ${tournamentName}!`, 'success');
}

// ───────────── Generic Modal Helpers ─────────────
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// Close modals on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
});

// Highlight selected tournament option
document.addEventListener('change', (e) => {
    if (e.target.name === 'tournament') {
        document.querySelectorAll('.tournament-option').forEach(o => o.classList.remove('selected'));
        e.target.closest('.tournament-option').classList.add('selected');
    }
});

// ───────────── Session & Init ─────────────
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Personalize the dashboard
    const welcome = document.getElementById('welcomeText');
    if (welcome) welcome.textContent = `Welcome, ${currentUser}`;
    setGreeting(currentUser);
    setupActionButtons();

    // Highlight active tier card on dashboard load
    const ptsRaw = localStorage.getItem('userPoints');
    const pts = ptsRaw !== null ? parseInt(ptsRaw) : 0;
    highlightTierCards(getTier(pts).key);
});

// Shared helper: highlight the given tier key in the dashboard grid
function highlightTierCards(tierKey) {
    document.querySelectorAll('.tier-card').forEach(card => {
        card.classList.toggle('active', card.dataset.tier === tierKey);
    });
}

// Terminate Session  
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
