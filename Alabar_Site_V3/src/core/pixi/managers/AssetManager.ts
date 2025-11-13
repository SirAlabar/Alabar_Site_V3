/**
 * AssetManager - Manages loading and caching of all game assets
 * Uses Pixi.js Assets API for efficient loading
 */

import { Assets, Spritesheet, Texture } from 'pixi.js';
import type { ProgressCallback, CompleteCallback } from '@core/types';

export class AssetManager {
  private spritesheets: Map<string, Spritesheet> = new Map();
  private textures: Map<string, Texture> = new Map();
  private isLoaded: boolean = false;

  public onProgress: ProgressCallback | null = null;
  public onComplete: CompleteCallback | null = null;

  /**
   * Define all assets to load
   */
  private readonly assetManifest = {
    // Spritesheets
    spritesheets: [
      { name: 'player_spritesheet', path: '/assets/spritesheets/player.json' },
      { name: 'monsters_spritesheet', path: '/assets/spritesheets/monsters.json' },
      { name: 'clouds_spritesheet', path: '/assets/spritesheets/clouds.json' },
      { name: 'ui_spritesheet', path: '/assets/spritesheets/ui.json' }
    ],
    
    // Individual textures
    textures: [
      { name: 'bg_day_layer1', path: '/assets/backgrounds/day/layer1.png' },
      { name: 'bg_day_layer2', path: '/assets/backgrounds/day/layer2.png' },
      { name: 'bg_day_layer3', path: '/assets/backgrounds/day/layer3.png' },
      { name: 'bg_night_layer1', path: '/assets/backgrounds/night/layer1.png' },
      { name: 'bg_night_layer2', path: '/assets/backgrounds/night/layer2.png' },
      { name: 'bg_night_layer3', path: '/assets/backgrounds/night/layer3.png' },
      { name: 'sword_cursor', path: '/assets/ui/sword_cursor.png' }
    ]
  };

  /**
   * Load all assets
   */
  async loadAllAssets(): Promise<void> {
    const allAssets = [
      ...this.assetManifest.spritesheets.map(asset => ({
        alias: asset.name,
        src: asset.path
      })),
      ...this.assetManifest.textures.map(asset => ({
        alias: asset.name,
        src: asset.path
      }))
    ];

    const totalAssets = allAssets.length;
    let loadedAssets = 0;

    try {
      // Add all assets to the loader
      Assets.addBundle('game', allAssets);

      // Load with progress tracking
      const loadedBundle = await Assets.loadBundle('game', (progress) => {
        loadedAssets = Math.floor(progress * totalAssets);
        const normalizedProgress = loadedAssets / totalAssets;
        
        if (this.onProgress) {
          this.onProgress(normalizedProgress);
        }
      });

      // Store loaded assets
      this.processLoadedAssets(loadedBundle);
      
      this.isLoaded = true;

      if (this.onComplete) {
        this.onComplete();
      }
    } catch (error) {
      console.error('Error loading assets:', error);
      throw error;
    }
  }

  /**
   * Process and categorize loaded assets
   */
  private processLoadedAssets(loadedAssets: Record<string, any>): void {
    Object.entries(loadedAssets).forEach(([name, asset]) => {
      if (asset instanceof Spritesheet) {
        this.spritesheets.set(name, asset);
      } else if (asset instanceof Texture) {
        this.textures.set(name, asset);
      }
    });

    console.log(`Loaded ${this.spritesheets.size} spritesheets and ${this.textures.size} textures`);
  }

  /**
   * Get a spritesheet by name
   */
  getSpritesheet(name: string): Spritesheet | null {
    const spritesheet = this.spritesheets.get(name);
    if (!spritesheet) {
      console.warn(`Spritesheet "${name}" not found`);
      return null;
    }
    return spritesheet;
  }

  /**
   * Get a texture by name
   */
  getTexture(name: string): Texture | null {
    const texture = this.textures.get(name);
    if (!texture) {
      console.warn(`Texture "${name}" not found`);
      return null;
    }
    return texture;
  }

  /**
   * Get a texture from a spritesheet
   */
  getSpritesheetTexture(spritesheetName: string, textureName: string): Texture | null {
    const spritesheet = this.getSpritesheet(spritesheetName);
    if (!spritesheet) {
      return null;
    }

    const texture = spritesheet.textures[textureName];
    if (!texture) {
      console.warn(`Texture "${textureName}" not found in spritesheet "${spritesheetName}"`);
      return null;
    }

    return texture;
  }

  /**
   * Check if assets are loaded
   */
  isAssetsLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Unload all assets (cleanup)
   */
  async unloadAssets(): Promise<void> {
    await Assets.unloadBundle('game');
    this.spritesheets.clear();
    this.textures.clear();
    this.isLoaded = false;
  }
}

/**
 * Create and return a singleton AssetManager instance
 */
let assetManagerInstance: AssetManager | null = null;

export function createAssetManager(): AssetManager {
  if (!assetManagerInstance) {
    assetManagerInstance = new AssetManager();
  }
  return assetManagerInstance;
}

export function getAssetManager(): AssetManager | null {
  return assetManagerInstance;
}
