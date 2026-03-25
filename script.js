/**
 * Eventify - Main JavaScript
 * 
 * This script handles the core functionality of the event listing site:
 * 1. Dynamic fetching of event data from a JSON file.
 * 2. Rendering event cards using a responsive grid system.
 * 3. Real-time search filtering by event name.
 * 4. Interactive UI elements like navigation and scroll animations.
 */

const calendarSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const pinSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;

let allEvents = [];

/**
 * Fetches event data from 'events.json'.
 * On success, stores the data and triggers the initial render.
 * On failure, displays an error message to the user.
 */
async function fetchEvents() {
    try {
        const response = await fetch('events.json');
        if (!response.ok) throw new Error('Failed to fetch events');
        allEvents = await response.json();
        // Initial render of all fetched events
        renderEvents(allEvents);
    } catch (error) {
        console.error('Error loading events:', error);
        // User-friendly error message in the grid
        document.getElementById('eventsGrid').innerHTML = '<p class="text-center text-danger">Error loading events. Please try again later.</p>';
    }
}

/**
 * Render events into the grid
 * @param {Array} data - Array of event objects
 */
function renderEvents(data) {
    const grid = document.getElementById('eventsGrid');
    grid.innerHTML = '';

    if (data.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" role="status">
                <span class="emoji" aria-hidden="true">🔍</span>
                No events found. Try a different search term.
            </div>`;
        return;
    }

    data.forEach((ev, index) => {
        const col = document.createElement('div');
        col.className = 'col-12 col-md-6 col-lg-4 d-flex align-items-stretch reveal';
        
        col.innerHTML = `
            <article class="event-card w-100" role="listitem" aria-label="${ev.name}">
                <div class="card-image" style="background:${ev.cardBg || '#f0f0f0'};" aria-hidden="true">
                    <div class="card-emoji-wrap" role="img" aria-label="${ev.category} event">${ev.emoji || '📅'}</div>
                    <span class="card-category-pill">${ev.category || 'Event'}</span>
                </div>
                <div class="card-body">
                    <h3 class="card-title">${ev.name}</h3>
                    <div class="card-meta">
                        ${calendarSVG}
                        <span>${ev.date} · ${ev.time}</span>
                    </div>
                    <div class="card-location">
                        ${pinSVG}
                        <span>${ev.location}</span>
                    </div>
                    <p class="card-desc">${ev.description}</p>
                    <div class="card-divider" aria-hidden="true"></div>
                    <div class="card-footer">
                        <span class="card-price ${ev.price.toLowerCase() === 'free' ? 'free' : 'paid'}">${ev.price}</span>
                        <button class="card-register" onclick="handleRegister('${ev.name}')" aria-label="Register for ${ev.name}">
                            Register →
                        </button>
                    </div>
                </div>
            </article>`;

        grid.appendChild(col);
    });

    // Re-trigger intersection observer for reveal effect
    observeCards();
}

/**
 * Filters the list of events based on the search query.
 * Triggered on every input change in the search field.
 * @param {string} query - The search term entered by the user.
 */
function filterEvents(query) {
    const q = query.trim().toLowerCase();
    // Filter the global events array based on name match
    const filtered = allEvents.filter(ev => ev.name.toLowerCase().includes(q));
    // Re-render the grid with the filtered results
    renderEvents(filtered);
}

/**
 * Intersection Observer for scroll animations
 */
function observeCards() {
    const cards = document.querySelectorAll('.event-card');
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, i * 80);
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    cards.forEach(card => io.observe(card));
}

/**
 * Handle registration button click
 */
function handleRegister(name) {
    alert(`You have successfully registered for: ${name}`);
}

/**
 * Initialize application
 */
document.addEventListener('DOMContentLoaded', () => {
    // Navigation Logic
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navDrawer = document.getElementById('navDrawer');

    if (hamburgerBtn && navDrawer) {
        hamburgerBtn.addEventListener('click', () => {
            const isOpen = navDrawer.classList.toggle('open');
            hamburgerBtn.classList.toggle('open', isOpen);
            hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
        });

        window.closeDrawer = function() {
            navDrawer.classList.remove('open');
            hamburgerBtn.classList.remove('open');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
        };

        document.addEventListener('click', (e) => {
            if (!navDrawer.contains(e.target) && !hamburgerBtn.contains(e.target)) {
                closeDrawer();
            }
        });
    }

    // Cursor Glow
    const cursorGlow = document.getElementById('cursor-glow');
    if (cursorGlow) {
        document.addEventListener('mousemove', (e) => {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
            cursorGlow.style.opacity = '1';
        });
        document.addEventListener('mouseleave', () => {
            cursorGlow.style.opacity = '0';
        });
    }

    // Ripple Effect
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.card-register, .btn-primary, .btn-secondary');
        if (!btn) return;
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        const rect = btn.getBoundingClientRect();
        ripple.style.left = (e.clientX - rect.left) + 'px';
        ripple.style.top = (e.clientY - rect.top) + 'px';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });

    // Aurora Background (Refactored to simpler canvas logic)
    initAurora();

    // Initial Fetch
    fetchEvents();
});

/**
 * Simple Aurora Background initialization
 */
function initAurora() {
    const canvas = document.getElementById('aurora-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let time = 0;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function animate() {
        time++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FAFAF8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Simulating some movement
        const x = canvas.width * 0.5 + Math.sin(time * 0.01) * 100;
        const y = canvas.height * 0.5 + Math.cos(time * 0.01) * 100;
        
        const g = ctx.createRadialGradient(x, y, 0, x, y, 400);
        g.addColorStop(0, 'rgba(212, 98, 42, 0.05)');
        g.addColorStop(1, 'rgba(212, 98, 42, 0)');
        
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 400, 0, Math.PI * 2);
        ctx.fill();

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
}
