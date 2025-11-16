/**
 * main.ts - Application entry point
 * App singleton now handles all initialization via managers
 */

import './css/style.css';
import { App } from './App';

/**
 * Initialize the application
 */
async function initApp(): Promise<void>
{
  console.log('🏰 Alabar Site V3 - Initializing...');
  
  try
  {
    // Initialize App singleton
    // This handles: Pixi, Layout, Header (and later: Assets, Router, Scenes)
    const app = App.getInstance();
    await app.initialize();
    
    // Build test content in #content-mount
    buildTestContent();
    
    console.log('🚀 Application ready!');
  }
  catch (error)
  {
    console.error('❌ Application initialization failed:', error);
    showError(error);
  }
}

/**
 * Build test content in the content mount area
 */
function buildTestContent(): void
{
  const contentMount = document.getElementById('content-mount');
  
  if (!contentMount)
  {
    console.error('❌ Content mount not found');
    return;
  }
  
  // Test content with padding for header clearance
  contentMount.innerHTML = `
    <div class="min-h-screen flex items-center justify-center pt-20">
      <div class="text-center animate-fade-in">
        <h1 class="font-pixel text-4xl text-rpg-accent mb-6 animate-pixel-blink">
          ALABAR V3
        </h1>
        <p class="font-game text-2xl text-rpg-text mb-4">
          Medieval RPG Portfolio
        </p>
        <p class="font-game text-lg text-gray-400 mb-2">
          ✓ Vite + TypeScript + Tailwind
        </p>
        <p class="font-game text-lg text-gray-400 mb-2">
          ✓ Pixi.js Canvas Layer
        </p>
        <p class="font-game text-lg text-gray-400 mb-2">
          ✓ Liquid Glass Header
        </p>
        <p class="font-game text-lg text-gray-400 mb-8">
          ✓ Manager Architecture
        </p>
        <button class="btn-pixel" onclick="alert('Router coming next!')">
          START QUEST
        </button>
        <div class="mt-8">
          <p class="font-game text-sm text-gray-500">
            App → LayoutManager → Layout (#header-mount, #content-mount)
          </p>
          <p class="font-game text-sm text-gray-500">
            App → HeaderManager → Header (liquid glass effect)
          </p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Show error screen
 */
function showError(error: unknown): void
{
  const app = document.getElementById('app');
  if (!app) return;
  
  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <h1 class="font-pixel text-3xl text-red-500 mb-4">ERROR</h1>
        <p class="font-game text-xl text-rpg-text mb-4">
          Failed to initialize application
        </p>
        <p class="font-game text-sm text-gray-500 mb-6">
          ${error}
        </p>
        <button class="btn-pixel" onclick="location.reload()">
          RELOAD
        </button>
      </div>
    </div>
  `;
}

// Start when DOM is ready
if (document.readyState === 'loading')
{
  document.addEventListener('DOMContentLoaded', initApp);
}
else
{
  initApp();
}