/**
 * main.ts - Application entry point
 * Initializes PIXI app, loads assets, then initializes router
 */

import '@styles/main.css';
import { initPixiApp, getPixiAppState } from '@pixi/PixiInitializer';
import { initRouter } from '@core/router/Router';

/**
 * Main application initialization
 */
async function initApp(): Promise<void> {
  console.log('🎮 Alabar Site V2 - Initializing...');

  try {
    // Initialize PIXI and load all assets
    await initPixiApp();

    // Check if PIXI initialized successfully
    const pixiState = getPixiAppState();
    if (!pixiState.isInitialized) {
      throw new Error('PIXI initialization failed');
    }

    console.log('✅ PIXI Application initialized');

    // Initialize router after PIXI is ready
    initRouter();

    console.log('✅ Router initialized');
    console.log('🚀 Application ready!');
  } catch (error) {
    console.error('❌ Application initialization failed:', error);
    
    // Show error message
    const app = document.querySelector('#app');
    if (app) {
      app.innerHTML = `
        <div class="min-h-screen bg-rpg-darker flex items-center justify-center">
          <div class="text-center">
            <h1 class="font-pixel text-4xl text-red-500 mb-4">ERROR</h1>
            <p class="font-game text-xl text-rpg-text mb-4">Failed to initialize application</p>
            <p class="font-game text-sm text-gray-500">${error}</p>
            <button onclick="location.reload()" class="btn-pixel mt-6">
              RELOAD
            </button>
          </div>
        </div>
      `;
    }
  }
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
