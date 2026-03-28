const toastEl = document.getElementById('toast');
const greetingEl = document.getElementById('greeting');
const subTextEl = document.getElementById('subText');

function showToast(message, type = 'info') {
    if(!toastEl) return;
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
    if(!greetingEl || !subTextEl) return;
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
            selector: '.action-grid .action-card:nth-child(2) .action-btn',
            message: 'No tournaments are live yet. Check back soon!',
            type: 'error',
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
            // Delay navigation slightly so the user sees the toast
            if (action.href) {
                setTimeout(() => {
                    window.location.href = action.href;
                }, 800);
            }
        });
    });
}

// Check Session & LocalStorage Functionality
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        // Redirect user to login state if not authenticated
        window.location.href = 'login.html';
        return;
    }

    // Personalize the dashboard
    const welcome = document.getElementById('welcomeText');
    if(welcome) welcome.textContent = `Welcome, ${currentUser}`;
    setGreeting(currentUser);
    setupActionButtons();
});

// Terminate Session  
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}
