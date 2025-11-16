/**
 * AssetManager - Handles loading and managing game assets
 * Complete version with all game assets for Pixi.js 8.x
 */

import { Assets, Texture, Spritesheet } from 'pixi.js';

export class AssetManager
{
  private static instance: AssetManager;
  
  // Callbacks
  public onProgress?: (progress: number) => void;
  public onComplete?: () => void;
  
  // Storage
  private textures: Map<string, Texture> = new Map();
  private spritesheets: Map<string, Spritesheet> = new Map();
  private isLoading: boolean = false;
  private isLoaded: boolean = false;
  
  private constructor() {}
  
  static getInstance(): AssetManager
  {
    if (!AssetManager.instance)
    {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }
  
  /**
   * Main loading method - loads all assets
   */
  async loadAll(): Promise<void>
  {
    if (this.isLoading)
    {
      console.warn('Assets already loading');
      return;
    }
    
    if (this.isLoaded)
    {
      console.log('Assets already loaded');
      return;
    }
    
    this.isLoading = true;
    this.updateProgress(0);
    
    try
    {
      await this.initializeAssets();
      await this.loadAssetBundles();
      await this.processSpritesheets();
      
      this.isLoaded = true;
      this.updateProgress(100);
      
      if (this.onComplete)
      {
        this.onComplete();
      }
      
      console.log('✅ All assets loaded');
    }
    catch (error)
    {
      console.error('❌ Failed to load assets:', error);
      throw error;
    }
    finally
    {
      this.isLoading = false;
    }
  }
  
  /**
   * Initialize Pixi Assets with manifest
   */
  private async initializeAssets(): Promise<void>
  {
    const manifest = this.createManifest();
    await Assets.init({ manifest });
    this.updateProgress(5);
  }
  
  /**
   * Load all asset bundles
   */
  private async loadAssetBundles(): Promise<void>
  {
    const bundles = ['player', 'monsters', 'backgrounds', 'ui', 'spritesheets'];
    const totalBundles = bundles.length;
    let loadedBundles = 0;
    
    for (const bundleName of bundles)
    {
      try
      {
        const assets = await Assets.loadBundle(bundleName, (progress) =>
        {
          const baseProgress = 5 + (loadedBundles / totalBundles) * 70;
          const bundleProgress = (progress / totalBundles) * 70;
          this.updateProgress(baseProgress + bundleProgress);
        });
        
        this.processLoadedAssets(bundleName, assets);
        loadedBundles++;
      }
      catch (error)
      {
        console.error(`Failed to load bundle: ${bundleName}`, error);
      }
    }
    
    this.updateProgress(75);
  }
  
  /**
   * Create asset manifest for Pixi Assets
   */
  private createManifest(): any
  {
    return {
      bundles: [
        // Player bundle
        {
          name: 'player',
          assets: [
            {
              alias: 'player_spritesheet',
              src: '/assets/images/player/Leo_Hero.json'
            }
          ]
        },
        
        // Monsters bundle
        {
          name: 'monsters',
          assets: [
            // Orcs
            {
              alias: 'orc1_spritesheet',
              src: '/assets/images/monsters/Orc1.json'
            },
            {
              alias: 'orc2_spritesheet',
              src: '/assets/images/monsters/Orc2.json'
            },
            {
              alias: 'orc3_spritesheet',
              src: '/assets/images/monsters/Orc3.json'
            },
            // Plants
            {
              alias: 'plant1_spritesheet',
              src: '/assets/images/monsters/Plant1.json'
            },
            {
              alias: 'plant2_spritesheet',
              src: '/assets/images/monsters/Plant2.json'
            },
            {
              alias: 'plant3_spritesheet',
              src: '/assets/images/monsters/Plant3.json'
            },
            // Slimes
            {
              alias: 'slime1_spritesheet',
              src: '/assets/images/monsters/Slime1.json'
            },
            {
              alias: 'slime2_spritesheet',
              src: '/assets/images/monsters/Slime2.json'
            },
            {
              alias: 'slime3_spritesheet',
              src: '/assets/images/monsters/Slime3.json'
            },
            // Vampires
            {
              alias: 'vampire1_spritesheet',
              src: '/assets/images/monsters/Vampire1.json'
            },
            {
              alias: 'vampire2_spritesheet',
              src: '/assets/images/monsters/Vampire2.json'
            },
            {
              alias: 'vampire3_spritesheet',
              src: '/assets/images/monsters/Vampire3.json'
            }
          ]
        },
        
        // Background assets bundle
        {
          name: 'backgrounds',
          assets: [
            // Light theme backgrounds
            {
              alias: 'bg_light_mountain',
              src: '/assets/images/background/light/mountain.webp'
            },
            {
              alias: 'bg_light_castle',
              src: '/assets/images/background/light/castle.webp'
            },
            {
              alias: 'bg_light_field1',
              src: '/assets/images/background/light/field1.webp'
            },
            {
              alias: 'bg_light_field2',
              src: '/assets/images/background/light/field2.webp'
            },
            {
              alias: 'bg_light_field3',
              src: '/assets/images/background/light/field3.webp'
            },
            {
              alias: 'bg_light_field4',
              src: '/assets/images/background/light/field4.webp'
            },
            {
              alias: 'bg_light_field5',
              src: '/assets/images/background/light/field5.webp'
            },
            {
              alias: 'bg_light_field6',
              src: '/assets/images/background/light/field6.webp'
            },
            {
              alias: 'bg_light_field7',
              src: '/assets/images/background/light/field7.webp'
            },
            // Dark theme backgrounds
            {
              alias: 'bg_dark_background',
              src: '/assets/images/background/dark/background_night.webp'
            },
            {
              alias: 'bg_dark_mountain',
              src: '/assets/images/background/dark/mountain_night.webp'
            },
            {
              alias: 'bg_dark_moon',
              src: '/assets/images/background/dark/moon_night.webp'
            },
            {
              alias: 'bg_dark_castle',
              src: '/assets/images/background/dark/castle_night.webp'
            },
            {
              alias: 'bg_dark_field1',
              src: '/assets/images/background/dark/field1_night.webp'
            },
            {
              alias: 'bg_dark_field2',
              src: '/assets/images/background/dark/field2_night.webp'
            },
            {
              alias: 'bg_dark_field3',
              src: '/assets/images/background/dark/field3_night.webp'
            },
            {
              alias: 'bg_dark_field4',
              src: '/assets/images/background/dark/field4_night.webp'
            },
            {
              alias: 'bg_dark_field5',
              src: '/assets/images/background/dark/field5_night.webp'
            },
            {
              alias: 'bg_dark_field6',
              src: '/assets/images/background/dark/field6_night.webp'
            },
            {
              alias: 'bg_dark_field7',
              src: '/assets/images/background/dark/field7_night.webp'
            }
          ]
        },
        
        // UI assets bundle
        {
          name: 'ui',
          assets: [
            {
              alias: 'avatar',
              src: '/assets/images/Avatar_Profile_64px.gif'
            },
            {
              alias: 'github_logo',
              src: '/assets/images/github_logo.png'
            },
            {
              alias: 'linkedin_logo',
              src: '/assets/images/linkedin_logo.png'
            },
            {
              alias: 'cursor_light',
              src: '/assets/images/cursor_light.png'
            },
            {
              alias: 'cursor_night',
              src: '/assets/images/cursor_night.png'
            }
          ]
        },
        
        // Spritesheets bundle (clouds)
        {
          name: 'spritesheets',
          assets: [
            {
              alias: 'clouds_spritesheet',
              src: '/assets/images/background/light/clouds.json'
            }
          ]
        }
      ]
    };
  }
  
  /**
   * Process loaded assets and store them
   */
  private processLoadedAssets(bundleName: string, assets: any): void
  {
    for (const [alias, asset] of Object.entries(assets))
    {
      if (asset instanceof Texture)
      {
        this.textures.set(alias, asset);
      }
      else if (asset instanceof Spritesheet)
      {
        this.spritesheets.set(alias, asset);
      }
    }
    
    console.log(`✅ Loaded bundle: ${bundleName} (${Object.keys(assets).length} assets)`);
  }
  
  /**
   * Process spritesheets after loading
   */
  private async processSpritesheets(): Promise<void>
  {
    const spritesheetAliases = [
      'player_spritesheet',
      'orc1_spritesheet', 'orc2_spritesheet', 'orc3_spritesheet',
      'plant1_spritesheet', 'plant2_spritesheet', 'plant3_spritesheet',
      'slime1_spritesheet', 'slime2_spritesheet', 'slime3_spritesheet',
      'vampire1_spritesheet', 'vampire2_spritesheet', 'vampire3_spritesheet',
      'clouds_spritesheet'
    ];
    
    for (const alias of spritesheetAliases)
    {
      try
      {
        const spritesheet = await Assets.get(alias);
        if (spritesheet && spritesheet instanceof Spritesheet)
        {
          this.spritesheets.set(alias, spritesheet);
        }
      }
      catch (error)
      {
        console.warn(`Could not load spritesheet: ${alias}`, error);
      }
    }
    
    this.updateProgress(95);
  }
  
  /**
   * Update loading progress
   */
  private updateProgress(progress: number): void
  {
    const clampedProgress = Math.min(Math.max(progress, 0), 100);
    
    if (this.onProgress)
    {
      this.onProgress(clampedProgress / 100); // Convert to 0-1 for LoadingUI
    }
  }
  
  /**
   * Get a texture by alias
   */
  getTexture(alias: string): Texture | null
  {
    const texture = this.textures.get(alias);
    
    if (!texture)
    {
      console.warn(`Texture not found: ${alias}`);
      return null;
    }
    
    return texture;
  }
  
  /**
   * Get a spritesheet by alias
   */
  getSpritesheet(alias: string): Spritesheet | null
  {
    const spritesheet = this.spritesheets.get(alias);
    
    if (!spritesheet)
    {
      console.warn(`Spritesheet not found: ${alias}`);
      return null;
    }
    
    return spritesheet;
  }
  
  /**
   * Get sprite frames from a spritesheet
   */
  getSpriteFrames(spritesheetAlias: string): Texture[]
  {
    const spritesheet = this.getSpritesheet(spritesheetAlias);
    if (spritesheet && spritesheet.textures)
    {
      return Object.values(spritesheet.textures);
    }
    
    console.warn(`No frames found for spritesheet: ${spritesheetAlias}`);
    return [];
  }
  
  /**
   * Get background texture by theme and layer
   */
  getBackgroundTexture(theme: 'light' | 'dark', layer: string): Texture | null
  {
    const alias = `bg_${theme}_${layer}`;
    return this.getTexture(alias);
  }
  
  /**
   * Get all background textures for a theme
   */
  getBackgroundTextures(theme: 'light' | 'dark'): Record<string, Texture>
  {
    const backgrounds: Record<string, Texture> = {};
    const layers = ['mountain', 'castle', 'field1', 'field2', 'field3', 'field4', 'field5', 'field6', 'field7'];
    
    if (theme === 'dark')
    {
      layers.unshift('background', 'moon');
    }
    
    for (const layer of layers)
    {
      const texture = this.getBackgroundTexture(theme, layer);
      if (texture)
      {
        backgrounds[layer] = texture;
      }
    }
    
    return backgrounds;
  }
  
  /**
   * Get background color for theme
   */
  getBackgroundColor(theme: 'light' | 'dark'): number
  {
    return theme === 'light' ? 0x87CEEB : 0x191970;
  }
  
  /**
   * Check if assets are loaded
   */
  isAssetsLoaded(): boolean
  {
    return this.isLoaded;
  }
}