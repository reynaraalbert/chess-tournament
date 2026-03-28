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
function showStats() {
    document.getElementById('optionsDropdown').classList.remove('open');

    const username = localStorage.getItem('currentUser') || 'Unknown';
    const elo = parseInt(localStorage.getItem('userElo') || '1200');
    const registeredRaw = localStorage.getItem('registeredTournaments');
    const registered = registeredRaw ? JSON.parse(registeredRaw) : [];

    // Determine rank tier
    let rank = '🔵 Beginner';
    if (elo >= 1500) rank = '💎 Diamond';
    else if (elo >= 1300) rank = '🥇 Gold';
    else if (elo >= 1150) rank = '🥈 Silver';
    else if (elo >= 1000) rank = '🥉 Bronze';

    document.getElementById('statUsername').textContent = username;
    document.getElementById('statElo').textContent = `${elo} ELO`;
    document.getElementById('statRank').textContent = rank;
    document.getElementById('statTournaments').textContent = registered.length;

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
});

// Terminate Session  
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
