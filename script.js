const localFallbackGames = [
  { title: 'Minecraft 1.21.4', slug: 'minecraft-1-21-4', file: '183.png' },
  { title: "Five Nights at Freddy's: Sister Location", slug: 'five-nights-at-freddy-s-sister-location', file: '185.png' },
  { title: 'People Playground', slug: 'people-playground', file: '194-m.png' },
  { title: 'ULTRAKILL', slug: 'ultrakill', file: '196.png' },
  { title: 'Buckshot Roulette', slug: 'buckshot-roulette', file: '205.png' },
  { title: 'Bendy and the Ink Machine', slug: 'bendy-and-the-ink-machine', file: '215.png' },
  { title: "That's Not My Neighbor", slug: "that-s-not-my-neighbor", file: '216.png' },
  { title: 'Half Life', slug: 'half-life', file: '262.png' },
  { title: "Baldi's Basics Plus", slug: "baldi-s-basics-plus", file: '467.png' },
  { title: 'Hollow Knight', slug: 'hollow-knight', file: '468.png' },
  { title: 'Karlson', slug: 'karlson', file: '542.png' },
  { title: 'Celeste', slug: 'celeste', file: '623.png' },
  { title: 'Terraria', slug: 'terraria', file: '669.png' },
  { title: 'Iron Lung', slug: 'iron-lung', file: '705.png' },
  { title: "Five Nights at Epstein's", slug: 'five-nights-at-epstein-s', file: '710.png' },
  { title: 'Clover Pit', slug: 'clover-pit', file: '716.png' },
  { title: 'Untitled Goose Game', slug: 'untitled-goose-game', file: '718.png' },
  { title: 'Hollow Knight: Silksong', slug: 'hollow-knight-silksong', file: '771.png' },
  { title: 'Geometry Dash', slug: 'geometry-dash', file: 'gd-remake.svg' },
  { title: 'Totally Accurate Battle Simulator (TABS)', slug: 'totally-accurate-battle-simulator-tabs', file: '827.png' },
  { title: 'Karlson 2D', slug: 'karlson-2d', file: 'karlson2d.png' }
];

const gameGrid = document.getElementById('game-grid');
const remoteBase = 'https://pinkdev.d13qic2f6zga3.amplifyapp.com/Interdimensional%20Lite_files';
const externalCdnBase = 'https://cdn.jsdelivr.net/gh/hazzatazza/algebruh-practise@main/';
const externalGamesJson = `${externalCdnBase}games.json`;

function formatDate(date) {
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
  const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
  const day = date.getDate();
  return `${weekday}, ${month} ${day}`;
}

function updateClock() {
  const now = new Date();
  const clock = document.getElementById('clock');
  const meridiem = document.getElementById('meridiem');
  const dateNode = document.getElementById('date');

  let hours = now.getHours();
  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minutes = String(now.getMinutes()).padStart(2, '0');

  clock.textContent = `${hours}:${minutes}`;
  meridiem.textContent = suffix;
  dateNode.textContent = formatDate(now);
}

function createGameCard(game) {
  const card = document.createElement('a');
  card.href = '#';
  card.className = 'game-card';
  card.target = '_self';
  card.rel = 'noopener noreferrer';
  card.setAttribute('aria-label', `Play ${game.title}`);

  card.addEventListener('click', (e) => {
    e.preventDefault();
    openGame(game.url || `https://pinkdev.d13qic2f6zga3.amplifyapp.com/game/${encodeURIComponent(game.slug || game.id || game.title)}`, game.title);
  });

  const img = document.createElement('img');

  const thumbSrc = game.thumb
    ? (externalCdnBase + game.thumb)
    : (game.file ? `${remoteBase}/${encodeURIComponent(game.file)}` : `https://placehold.co/900x900/101820/f5f7ff?text=${encodeURIComponent(game.title)}`);

  img.src = thumbSrc;
  img.alt = game.title;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.onerror = () => {
    img.src = `https://placehold.co/900x900/101820/f5f7ff?text=${encodeURIComponent(game.title)}`;
  };

  const playBadge = document.createElement('div');
  playBadge.className = 'play-badge';
  playBadge.innerHTML = `
    <div class="circle">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5.5v13l10-6.5L8 5.5Z"></path>
      </svg>
    </div>
  `;

  const label = document.createElement('div');
  label.className = 'card-label';
  label.innerHTML = `<span>${game.title}</span>`;

  card.append(img, playBadge, label);
  return card;
}

function renderGames(list) {
  gameGrid.innerHTML = '';
  list.forEach((game) => {
    gameGrid.appendChild(createGameCard(game));
  });
}

async function loadExternalGames() {
  try {
    const res = await fetch(externalGamesJson);
    if (!res.ok) throw new Error('Failed to fetch external games.json');

    const external = await res.json();

    const mapped = external.map((g) => ({
      title: g.title || g.id,
      url: g.url || null,
      thumb: g.thumb || null,
      id: g.id || null
    }));

    renderGames(mapped);
  } catch (err) {
    console.warn('Could not load external games.json — falling back to local list.', err);

    const mappedLocal = localFallbackGames.map((g) => ({
      title: g.title,
      slug: g.slug,
      file: g.file
    }));

    renderGames(mappedLocal);
  }
}

function openGame(url, title) {
  const iframe = document.getElementById('gameFrame');
  const active = document.getElementById('activeGame');
  const msg = document.getElementById('iframeMsg');

  if (!iframe || !active || !msg) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  active.innerText = title || '';
  msg.textContent = 'Loading in iframe…';
  iframe.src = 'about:blank';
  iframe.style.display = 'block';
  document.getElementById('modal').style.display = 'block';
  document.body.style.overflow = 'hidden';

  let loaded = false;
  iframe.onload = null;
  iframe.onerror = null;

  iframe.onload = () => {
    loaded = true;
    msg.textContent = '';
  };

  iframe.onerror = () => {
    loaded = false;
    msg.innerHTML = `This site disallows embedding. <a href="${escapeHtml(url)}" target="_blank" rel="noopener">Open in new tab</a>`;
    iframe.src = 'about:blank';
  };

  setTimeout(() => {
    try {
      iframe.src = url || 'about:blank';
    } catch (e) {
      msg.innerHTML = `Can't embed this URL. <a href="${escapeHtml(url)}" target="_blank" rel="noopener">Open in new tab</a>`;
      iframe.src = 'about:blank';
    }
  }, 0);

  setTimeout(() => {
    if (!loaded) {
      msg.innerHTML = `Unable to embed. <a href="${escapeHtml(url)}" target="_blank" rel="noopener">Open in new tab</a>`;
      iframe.src = 'about:blank';
    }
  }, 2000);
}

function closeGame() {
  const iframe = document.getElementById('gameFrame');
  const msg = document.getElementById('iframeMsg');

  document.getElementById('modal').style.display = 'none';
  iframe.src = 'about:blank';
  document.body.style.overflow = 'auto';

  if (msg) msg.textContent = '';
}

function escapeHtml(s) {
  return String(s).replace(/[&<>\"']/g, function(c) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c];
  });
}

updateClock();
loadExternalGames();
setInterval(updateClock, 15000);
