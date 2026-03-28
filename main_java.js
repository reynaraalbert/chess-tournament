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

// ───────────── Dynamic Animation Helpers ─────────────
function animateValue(id, start, end, duration, isDecimal = false) {
    const obj = document.getElementById(id);
    if (!obj) return;
    
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = progress * (end - start) + start;
        obj.innerHTML = isDecimal ? current.toFixed(1) : Math.floor(current);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
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
    const ptsRaw = localStorage.getItem('userPoints');
    const ethRaw = localStorage.getItem('userEth');
    const registeredRaw = localStorage.getItem('registeredTournaments');
    const registered = registeredRaw ? JSON.parse(registeredRaw) : [];

    let ptsDisplay = '—';
    let rankDisplay = '⬜ Unranked';
    let activeTierKey = 'unranked';
    let ethDisplay = '0.0 ETH';

    if (ptsRaw !== null) {
        const pts = parseInt(ptsRaw);
        const tier = getTier(pts);
        // ptsDisplay handled by animation
        rankDisplay = `${tier.icon} ${tier.name}`;
        activeTierKey = tier.key;

        setTimeout(() => {
            animateValue('statElo', 0, pts, 800);
        }, 300);
    }

    const eth = parseFloat(ethRaw || '0');
    setTimeout(() => {
        animateValue('statEth', 0, eth, 800, true);
    }, 500);

    document.getElementById('statUsername').textContent = username;
    document.getElementById('statRank').textContent = rankDisplay;
    document.getElementById('statTournaments').textContent = registered.length;

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

// ───────────── Customization Shop Logic ─────────────
const SHOP_ITEMS = {
    boards: [
        { id: 'default', name: 'Classic Wood', price: 0, class: 'board-default', img: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=200' },
        { id: 'red',     name: 'Simple Red',    price: 0, class: 'board-red',     img: 'img/red_board.png' },
        { id: 'blue',    name: 'Simple Blue',   price: 0, class: 'board-blue',    img: 'img/blue_board.png' },
        { id: 'green',   name: 'Simple Green',  price: 0, class: 'board-green',   img: 'img/green_board.png' },
        { id: 'marble',  name: 'Marble Stone',  price: 0, class: 'board-marble',  img: 'img/marble_board.png' },
        { id: 'ocean',   name: 'Ocean Blue',   price: 2.0, class: 'board-ocean', img: 'img/ocean_board.png' },
        { id: 'forest',  name: 'Forest Green', price: 2.5, class: 'board-forest', img: 'img/forest_board.png' },
        { id: 'dark',    name: 'Midnight',     price: 3.5, class: 'board-dark', img: 'img/midnight_board.png' },
        { id: 'purple',  name: 'Royal Purple', price: 4.0, class: 'board-purple', img: 'img/purple_board.png' },
    ],
    pieces: [
        { id: 'wikipedia', name: 'Standard (Wiki)', price: 0, img: 'https://chessboardjs.com/img/chesspieces/wikipedia/wN.png' },
        { id: 'alpha',     name: 'Alpha Style',    price: 3.0, img: 'https://chessboardjs.com/img/chesspieces/wikipedia/wB.png' },
        { id: 'cburnett',  name: 'Classic C.B.',    price: 3.5, img: 'https://chessboardjs.com/img/chesspieces/wikipedia/wR.png' },
        { id: 'neo',       name: 'Modern Neo',     price: 5.0, img: 'img/modern_pieces.png' },
    ]
};

let activeShopTab = 'boards';

function openShop() {
    renderShopItems();
    openModal('shopModal');
}

function switchShopTab(tab) {
    activeShopTab = tab;
    document.querySelectorAll('.shop-tab').forEach(t => {
        t.classList.toggle('active', t.textContent.toLowerCase().includes(tab));
    });
    renderShopItems();
}

function updateNavbarEth(animate = false) {
    const navEth = document.getElementById('navEthBalance');
    if (navEth) {
        const eth = parseFloat(localStorage.getItem('userEth') || '0');
        const span = navEth.querySelector('span');
        const oldVal = parseFloat(span.textContent);
        
        if (animate && oldVal !== eth) {
            animateValue('navEthBalanceSpan', oldVal, eth, 600, true);
            navEth.classList.add('pulse-gold');
            setTimeout(() => navEth.classList.remove('pulse-gold'), 1000);
        } else {
            span.textContent = eth.toFixed(1);
        }
    }
}

function renderShopItems() {
    const container = document.getElementById('shopContent');
    const balanceEl = document.getElementById('shopEthBalance');
    
    let eth = parseFloat(localStorage.getItem('userEth') || '0');
    balanceEl.textContent = eth.toFixed(1);
    updateNavbarEth(); // Also sync navbar

    const owned = JSON.parse(localStorage.getItem('ownedSkins') || '["default", "wikipedia"]');
    const equippedBoard = localStorage.getItem('equippedBoard') || 'default';
    const equippedPieces = localStorage.getItem('equippedPieces') || 'wikipedia';
    const hasUsedFreeClaim = localStorage.getItem('hasUsedFreeClaim') === 'true';

    container.innerHTML = '';
    
    SHOP_ITEMS[activeShopTab].forEach(item => {
        const isOwned = owned.includes(item.id);
        const isEquipped = (activeShopTab === 'boards' && equippedBoard === item.id) || 
                           (activeShopTab === 'pieces' && equippedPieces === item.id);
        
        const card = document.createElement('div');
        card.className = `shop-item ${isEquipped ? 'equipped' : ''}`;
        
        const previewHtml = item.img 
            ? `<img src="${item.img}" style="width:100%; height:100%; object-fit:cover;" onclick="previewItem('${activeShopTab}', '${item.id}')">` 
            : `<div class="item-preview-board" onclick="previewItem('${activeShopTab}', '${item.id}')"><div></div><div style="opacity:0.5"></div><div style="opacity:0.5"></div><div></div></div>`;

        let priceDisplay = `<i class="fa-brands fa-ethereum"></i> ${item.price.toFixed(1)}`;
        if (item.price === 0) priceDisplay = 'FREE';
        else if (!hasUsedFreeClaim) priceDisplay = '<span style="color:#2ecc71">FREE (Claim)</span>';

        card.innerHTML = `
            <div class="item-preview">
                ${previewHtml}
            </div>
            <div class="item-name">${item.name}</div>
            <div class="item-footer">
                <div class="item-price">${isOwned ? 'Owned' : priceDisplay}</div>
                ${isOwned 
                    ? `<button class="item-btn ${isEquipped ? 'equipped' : 'equip'}" onclick="equipItem('${activeShopTab}', '${item.id}')">${isEquipped ? 'Equipped' : 'Equip'}</button>`
                    : `<button class="item-btn buy" onclick="buyItem('${activeShopTab}', '${item.id}', ${item.price})">${(!hasUsedFreeClaim && item.price > 0) ? 'Claim' : 'Buy'}</button>`
                }
            </div>
        `;
        container.appendChild(card);
    });
}

function previewItem(category, id) {
    const item = SHOP_ITEMS[category].find(i => i.id === id);
    if (!item) return;

    const owned = JSON.parse(localStorage.getItem('ownedSkins') || '["default", "wikipedia"]');
    const hasUsedFreeClaim = localStorage.getItem('hasUsedFreeClaim') === 'true';
    const isOwned = owned.includes(id);

    document.getElementById('previewName').textContent = item.name;
    document.getElementById('previewImageContainer').innerHTML = `<img src="${item.img || ''}" alt="${item.name}">`;
    
    const actionsEl = document.getElementById('previewActions');
    
    let btnText = `Buy for ${item.price} ETH`;
    let btnPrice = item.price;
    if (item.price === 0) btnText = 'Get for Free';
    else if (!hasUsedFreeClaim) {
        btnText = 'Claim One-Time Freebie!';
        btnPrice = 0;
    }

    actionsEl.innerHTML = isOwned 
        ? `<button class="action-btn equip" onclick="equipItem('${category}', '${id}'); closeModal('shopPreviewModal');">Equip Now</button>`
        : `<button class="action-btn buy" onclick="buyItem('${category}', '${id}', ${btnPrice}); closeModal('shopPreviewModal');">${btnText}</button>`;

    openModal('shopPreviewModal');
}

function buyItem(category, id, price) {
    let eth = parseFloat(localStorage.getItem('userEth') || '0');
    let hasUsedFreeClaim = localStorage.getItem('hasUsedFreeClaim') === 'true';
    let finalPrice = price;

    // Handle free claim voucher for PREMIUM items only
    if (price > 0 && !hasUsedFreeClaim) {
        finalPrice = 0;
        localStorage.setItem('hasUsedFreeClaim', 'true');
        showToast('Premium Item Claimed for Free! 🎁', 'success');
    }

    if (eth < finalPrice) {
        showToast('Not enough ETH!', 'error');
        return;
    }

    if (finalPrice > 0) {
        eth -= finalPrice;
        localStorage.setItem('userEth', eth.toString());
        showToast('Purchase successful!', 'success');
    } else if (price === 0) {
        showToast('Item added for free!', 'success');
    }

    const owned = JSON.parse(localStorage.getItem('ownedSkins') || '["default", "wikipedia"]');
    if (!owned.includes(id)) {
        owned.push(id);
        localStorage.setItem('ownedSkins', JSON.stringify(owned));
        updateNavbarEth(); // Sync navbar on buy
        renderShopItems();
    }
}

function equipItem(category, id) {
    if (category === 'boards') {
        localStorage.setItem('equippedBoard', id);
    } else {
        localStorage.setItem('equippedPieces', id);
    }
    showToast('Item equipped!', 'success');
    renderShopItems();
}

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

    // Initialize ETH and Skins if not present
    if (localStorage.getItem('userEth') === null) {
        localStorage.setItem('userEth', '0.0');
    }
    if (localStorage.getItem('ownedSkins') === null) {
        localStorage.setItem('ownedSkins', JSON.stringify(['default', 'wikipedia']));
    }
    if (localStorage.getItem('hasUsedFreeClaim') === null) {
        localStorage.setItem('hasUsedFreeClaim', 'false');
    }

    updateNavbarEth(); // Initial navbar sync

    // Real-time tab sync
    window.addEventListener('storage', (e) => {
        if (e.key === 'userEth') {
            updateNavbarEth(true);
        }
    });

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
    showConfirm({
        title: 'Logout Match?',
        message: 'Are you sure you want to log out? Your progress is saved automatically.',
        icon: '🚪',
        btnText: 'Log Out',
        onConfirm: () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    });
}

function deleteAccount() {
    showConfirm({
        title: 'Delete Account?',
        message: 'All your ELO, ETH, and skins will be PERMANENTLY deleted. This cannot be undone!',
        icon: '⚠️',
        btnText: 'DELETE PERMANENTLY',
        btnClass: 'danger',
        onConfirm: () => {
            localStorage.clear();
            window.location.href = 'index.html';
        }
    });
}

/**
 * Reusable Confirmation Modal
 * @param {Object} options - {title, message, icon, btnText, btnClass, onConfirm}
 */
function showConfirm(options) {
    document.getElementById('confirmTitle').textContent = options.title || 'Are you sure?';
    document.getElementById('confirmMessage').textContent = options.message || '';
    document.getElementById('confirmIcon').textContent = options.icon || '❓';
    
    const confirmBtn = document.getElementById('confirmBtn');
    confirmBtn.textContent = options.btnText || 'Confirm';
    confirmBtn.className = 'action-btn ' + (options.btnClass || 'primary');
    
    // Set new click handler
    confirmBtn.onclick = () => {
        if (options.onConfirm) options.onConfirm();
        closeModal('confirmModal');
    };
    
    openModal('confirmModal');
}
