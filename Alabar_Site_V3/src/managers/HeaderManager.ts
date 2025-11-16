/**
 * HeaderManager - Handles mounting different header types
 * MINIMAL VERSION - Only 'default' type active, others commented for later
 */

import { Header } from '../components/common/Header';

// Module-level variables
let header: Header;
let currentType: string | null = null;

/**
 * Initialize header manager
 */
export function initHeaderManager(): void
{
  header = new Header();
}

/**
 * Mount header based on type
 */
export function mountHeader(type: string, selector: string = '#header-mount'): void
{
  currentType = type;

  if (header)
  {
    header.resetEvents();
  }

  const container = document.querySelector(selector);
  if (!container)
  {
    console.error(`Header container "${selector}" not found`);
    return;
  }

  switch (currentType)
  {
    case 'default':
      mountDefault(selector);
      break;
    // TODO: Uncomment when game features are ready
    /*
    case 'game':
      mountGame(container as HTMLElement);
      break;
    case 'minimal':
      mountMinimal(container as HTMLElement);
      break;
    */
    case 'none':
      container.innerHTML = '';
      break;
    default:
      mountDefault(selector);
  }
}

/**
 * Mount default header using the component system
 */
function mountDefault(selector: string): void
{
  if (!header)
  {
    console.error('Header not initialized');
    return;
  }

  header.mount(selector);
}

// TODO: Uncomment when game page is ready
/*
function mountGame(container: HTMLElement): void
{
  container.innerHTML = `
    <header class="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur border-b border-rpg-accent">
      <nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-2">
        ${renderGameLogo()}
        ${renderGameControls()}
      </nav>
    </header>
  `;

  requestAnimationFrame(() => setupGameHeaderEvents());
}

function mountMinimal(container: HTMLElement): void
{
  container.innerHTML = `
    <header class="fixed top-0 left-0 right-0 z-50 bg-rpg-dark/90 backdrop-blur">
      <nav class="mx-auto flex max-w-6xl items-center justify-center px-6 py-4">
        ${renderMinimalLogo()}
      </nav>
    </header>
  `;
}

function renderGameLogo(): string
{
  return `
    <h1 class="text-xl font-bold font-pixel text-rpg-accent">
      <a href="#/" data-link>ALABAR</a>
    </h1>
  `;
}

function renderGameControls(): string
{
  return `
    <div class="flex items-center space-x-4">
      <button id="pause-game" class="btn-pixel-secondary text-xs">
        ⏸️ PAUSE
      </button>
      <button id="exit-game" class="btn-pixel text-xs">
        ✕ EXIT
      </button>
    </div>
  `;
}

function renderMinimalLogo(): string
{
  return `
    <h1 class="text-2xl font-bold font-pixel text-rpg-accent">
      <a href="#/" data-link>ALABAR</a>
    </h1>
  `;
}

export function setupGameHeaderEvents(): void
{
  const pauseBtn = document.getElementById('pause-game');
  const exitBtn = document.getElementById('exit-game');

  if (pauseBtn)
  {
    pauseBtn.addEventListener('click', handlePauseGame);
  }

  if (exitBtn)
  {
    exitBtn.addEventListener('click', handleExitGame);
  }
}

function handlePauseGame(): void
{
  window.dispatchEvent(new CustomEvent('game:pause'));
}

function handleExitGame(): void
{
  const confirmed = confirm('Exit game? Progress will not be saved.');

  if (confirmed)
  {
    window.dispatchEvent(new CustomEvent('game:exit'));
    (window as any).navigateTo('/');
  }
}
*/

// Initialize when first imported
initHeaderManager();