/**
 * SiteGame.ts - Interactive website game layer
 * Simple gameplay on the site: walk around, kill enemies, find chest
 * Separate from the full Vampire Survivors game window
 */

import { Application, Container } from 'pixi.js';
import { AssetManager } from '../../managers/AssetManager';
import { Player } from '../entities/Player';

export class SiteGame
{
  private gameApp: Application;
  private assetManager: AssetManager;
  
  // Game container
  private gameContainer: Container;
  
  // Entities
  private player: Player | null = null;
  
  // Game state
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  
  // Boundaries (the green gameplay area)
  private gameBounds = {
    minX: 100,
    maxX: 0, // Will be set based on screen width
    minY: 0,  // Top of green fields
    maxY: 0   // Will be calculated
  };
  
  constructor(gameApp: Application, assetManager: AssetManager)
  {
    this.gameApp = gameApp;
    this.assetManager = assetManager;
    
    // Create game container
    this.gameContainer = new Container();
    this.gameContainer.label = 'SiteGameContainer';
    this.gameContainer.sortableChildren = true;
    
    // Position container at the start of green fields
    // SceneManager sets body.style.minHeight to the background height
    const bgHeight = this.getBackgroundHeight();
    
    this.gameContainer.position.set(
      0,                        // No horizontal offset
      bgHeight * 0.60          // Start at 60% (where green fields begin)
    );
    
    this.gameApp.stage.addChild(this.gameContainer);
    
    // Calculate initial bounds
    this.updateGameBounds();
    
    // Listen for resize
    window.addEventListener('resize', this.handleResize.bind(this));
    
    console.log('[SiteGame] Initialized - container at green fields');
    console.log(`[SiteGame] Background height: ${bgHeight}px, Container Y: ${bgHeight * 0.60}px`);
  }
  
  /**
   * Get the actual background height set by SceneManager
   */
  private getBackgroundHeight(): number
  {
    // SceneManager sets document.body.style.minHeight to the calculated background height
    const bodyMinHeight = document.body.style.minHeight;
    
    if (bodyMinHeight && bodyMinHeight.endsWith('px'))
    {
      const height = parseFloat(bodyMinHeight);
      if (!isNaN(height) && height > 0)
      {
        return height;
      }
    }
    
    // Fallback to screen height if not set yet
    console.warn('[SiteGame] Background height not set yet, using screen height as fallback');
    return this.gameApp.screen.height;
  }
  
  /**
   * Calculate game boundaries (the green playable area)
   * Bounds are RELATIVE to the gameContainer position
   */
  private updateGameBounds(): void
  {
    const screenWidth = this.gameApp.screen.width;
    const bgHeight = this.getBackgroundHeight();
    
    // Container is positioned at 60% of background height
    // Green fields cover the bottom 40% of background
    const greenFieldsHeight = bgHeight * 0.40;
    
    // Playable area: Full width with margins, full green fields height
    this.gameBounds = {
      minX: 50,                       // Small left margin
      maxX: screenWidth - 50,         // Small right margin
      minY: 10,                       // Small top margin
      maxY: greenFieldsHeight - 10    // Small bottom margin (relative to container)
    };
    
    // Update player bounds if player exists
    if (this.player)
    {
      this.player.updateBounds(this.gameBounds);
    }
    
    console.log('[SiteGame] Bounds updated (green fields area):', this.gameBounds);
    console.log(`[SiteGame] Green fields height: ${greenFieldsHeight}px`);
  }
  
  /**
   * Initialize the game
   */
  initialize(): void
  {
    if (this.isRunning)
    {
      console.warn('[SiteGame] Already running');
      return;
    }
    
    // Spawn player
    this.spawnPlayer();
    
    // Start game loop
    this.start();
    
    console.log('[SiteGame] Started');
  }
  
  /**
   * Spawn the player in the green fields area
   */
  private spawnPlayer(): void
  {
    const screenWidth = this.gameApp.screen.width;
    const bgHeight = this.getBackgroundHeight();
    const greenFieldsHeight = bgHeight * 0.40;
    
    // Position: Left-center of the playable area (inside green fields)
    const startX = screenWidth * 0.20;           // 20% from left
    const startY = greenFieldsHeight * 0.50;     // Middle of green fields height
    
    this.player = new Player(this.assetManager, {
      startX: startX,
      startY: startY,
      speed: 2.5,
      bounds: this.gameBounds
    });
    
    // Scale up the player (64px sprite to 128px)
    this.player.scale.set(2.0, 2.0);
    
    this.player.zIndex = 1000;
    this.gameContainer.addChild(this.player);
    
    console.log(`[SiteGame] Player spawned at (${startX}, ${startY}) in green fields`);
  }
  
  /**
   * Start the game loop
   */
  start(): void
  {
    if (this.isRunning)
    {
      return;
    }
    
    this.isRunning = true;
    this.gameApp.ticker.add(this.update, this);
    
    console.log('[SiteGame] Game loop started');
  }
  
  /**
   * Stop the game loop
   */
  stop(): void
  {
    if (!this.isRunning)
    {
      return;
    }
    
    this.isRunning = false;
    this.gameApp.ticker.remove(this.update, this);
    
    console.log('[SiteGame] Game loop stopped');
  }
  
  /**
   * Pause the game
   */
  pause(): void
  {
    this.isPaused = true;
    console.log('[SiteGame] Paused');
  }
  
  /**
   * Resume the game
   */
  resume(): void
  {
    this.isPaused = false;
    console.log('[SiteGame] Resumed');
  }
  
  /**
   * Main update loop
   */
  private update(ticker: any): void
  {
    if (this.isPaused)
    {
      return;
    }
    
    const delta = ticker.deltaTime;
    
    // Update player
    if (this.player)
    {
      this.player.update(delta);
    }
    
    // TODO: Update enemies
    // TODO: Update chest
    // TODO: Handle collisions
  }
  
  /**
   * Handle window resize
   */
  private handleResize(): void
  {
    const bgHeight = this.getBackgroundHeight();
    
    // Reposition container at green fields start (60% of background height)
    this.gameContainer.position.set(
      0,                        // No horizontal offset
      bgHeight * 0.60          // Start at 60%
    );
    
    // Update bounds
    this.updateGameBounds();
    
    // Reposition player if out of bounds
    if (this.player)
    {
      const pos = this.player.getPosition();
      const bounds = this.gameBounds;
      
      const clampedX = Math.max(bounds.minX, Math.min(bounds.maxX, pos.x));
      const clampedY = Math.max(bounds.minY, Math.min(bounds.maxY, pos.y));
      
      if (clampedX !== pos.x || clampedY !== pos.y)
      {
        this.player.setPosition(clampedX, clampedY);
      }
    }
    
    console.log(`[SiteGame] Resize - Container Y: ${bgHeight * 0.60}px`);
  }
  
  /**
   * Get player instance
   */
  getPlayer(): Player | null
  {
    return this.player;
  }
  
  /**
   * Get game container
   */
  getContainer(): Container
  {
    return this.gameContainer;
  }
  
  /**
   * Check if game is running
   */
  isGameRunning(): boolean
  {
    return this.isRunning;
  }
  
  /**
   * Check if game is paused
   */
  isGamePaused(): boolean
  {
    return this.isPaused;
  }
  
  /**
   * Cleanup and destroy
   */
  destroy(): void
  {
    this.stop();
    
    window.removeEventListener('resize', this.handleResize.bind(this));
    
    if (this.player)
    {
      this.player.destroy();
      this.player = null;
    }
    
    if (this.gameContainer)
    {
      this.gameContainer.destroy({ children: true });
    }
    
    console.log('[SiteGame] Destroyed');
  }
}