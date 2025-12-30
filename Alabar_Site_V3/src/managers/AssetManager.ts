/**
 * AssetManager - Handles loading and managing game assets
 * Complete version with all game assets for Pixi.js 8.x
 */

import { Assets, Texture, Spritesheet } from 'pixi.js';

type MonsterInfo = { spritesheet: string; data: string };

interface AssetPaths
{
  player: { spritesheet: string; data: string };
  monsters: Record<string, MonsterInfo>;
  clouds: { spritesheet: string; data: string };
  backgrounds: {
    light: { backgroundColor: string; [key: string]: string };
    dark: { backgroundColor: string; [key: string]: string };
  };
  ui: {
    avatar: string;
    github: string;
    linkedin: string;
    cursors: { light: string; dark: string };
  };
  powers: { spritesheet: string; data: string };
  collectables: { spritesheet: string; data: string };
}

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
  
  // Asset paths configuration
  private assetPaths: AssetPaths = {
    player: {
      spritesheet: '/assets/images/player/Leo_Hero.webp',
      data: '/assets/images/player/Leo_Hero.json'
    },
    monsters: {
      orc1: {
        spritesheet: '/assets/images/monsters/Orc1.webp',
        data: '/assets/images/monsters/Orc1.json'
      },
      orc2: {
        spritesheet: '/assets/images/monsters/Orc2.webp',
        data: '/assets/images/monsters/Orc2.json'
      },
      orc3: {
        spritesheet: '/assets/images/monsters/Orc3.webp',
        data: '/assets/images/monsters/Orc3.json'
      },
      plant1: {
        spritesheet: '/assets/images/monsters/Plant1.webp',
        data: '/assets/images/monsters/Plant1.json'
      },
      plant2: {
        spritesheet: '/assets/images/monsters/Plant2.webp',
        data: '/assets/images/monsters/Plant2.json'
      },
      plant3: {
        spritesheet: '/assets/images/monsters/Plant3.webp',
        data: '/assets/images/monsters/Plant3.json'
      },
      slime1: {
        spritesheet: '/assets/images/monsters/Slime1.webp',
        data: '/assets/images/monsters/Slime1.json'
      },
      slime2: {
        spritesheet: '/assets/images/monsters/Slime2.webp',
        data: '/assets/images/monsters/Slime2.json'
      },
      slime3: {
        spritesheet: '/assets/images/monsters/Slime3.webp',
        data: '/assets/images/monsters/Slime3.json'
      },
      vampire1: {
        spritesheet: '/assets/images/monsters/Vampire1.webp',
        data: '/assets/images/monsters/Vampire1.json'
      },
      vampire2: {
        spritesheet: '/assets/images/monsters/Vampire2.webp',
        data: '/assets/images/monsters/Vampire2.json'
      },
      vampire3: {
        spritesheet: '/assets/images/monsters/Vampire3.webp',
        data: '/assets/images/monsters/Vampire3.json'
      },
      turkey: {
        spritesheet: '/assets/images/monsters/Turkey.png',
        data: '/assets/images/monsters/Turkey.json'
      },
      pig: {
        spritesheet: '/assets/images/monsters/Pig.png',
        data: '/assets/images/monsters/Pig.json'
      }
    },
    clouds: {
      spritesheet: '/assets/images/background/light/clouds.webp',
      data: '/assets/images/background/light/clouds.json'
    },
    backgrounds: {
      light: {
        backgroundColor: '#87CEEB',
        mountain: '/assets/images/background/light/mountain.webp',
        castle: '/assets/images/background/light/castle.webp',
        field1: '/assets/images/background/light/field1.webp',
        field2: '/assets/images/background/light/field2.webp',
        field3: '/assets/images/background/light/field3.webp',
        field4: '/assets/images/background/light/field4.webp',
        field5: '/assets/images/background/light/field5.webp',
        field6: '/assets/images/background/light/field6.webp',
        field7: '/assets/images/background/light/field7.webp'
      },
      dark: {
        backgroundColor: '#191970',
        background: '/assets/images/background/dark/background_night.webp',
        mountain: '/assets/images/background/dark/mountain_night.webp',
        moon: '/assets/images/background/dark/moon_night.webp',
        castle: '/assets/images/background/dark/castle_night.webp',
        field1: '/assets/images/background/dark/field1_night.webp',
        field2: '/assets/images/background/dark/field2_night.webp',
        field3: '/assets/images/background/dark/field3_night.webp',
        field4: '/assets/images/background/dark/field4_night.webp',
        field5: '/assets/images/background/dark/field5_night.webp',
        field6: '/assets/images/background/dark/field6_night.webp',
        field7: '/assets/images/background/dark/field7_night.webp'
      }
    },
    ui: {
      avatar: '/assets/images/Avatar_Profile_64px.gif',
      github: '/assets/images/github_logo.png',
      linkedin: '/assets/images/linkedin_logo.png',
      cursors: {
        light: '/assets/images/cursor_light.png',
        dark: '/assets/images/cursor_night.png'
      }
    },
    powers: {
      spritesheet: '/assets/images/powers.png',
      data: '/assets/images/powers.json'
    },
    collectables: {
      spritesheet: '/assets/images/collectables.webp',
      data: '/assets/images/collectables.json'
    }
  };
  
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
    const bundleName = 'game-assets';
    
    try
    {
      const assets = await Assets.loadBundle(bundleName, (progress) =>
      {
        const totalProgress = 5 + (progress * 70);
        this.updateProgress(totalProgress);
      });
      
      this.processLoadedAssets(bundleName, assets);
    }
    catch (error)
    {
      console.error(`Failed to load bundle: ${bundleName}`, error);
    }
    
    this.updateProgress(75);
  }
  
  /**
   * Create asset manifest for Pixi Assets
   */
  private createManifest(): any
  {
    const assets: any[] = [];
    
    // Player spritesheet
    assets.push({
      alias: 'player_spritesheet',
      src: this.assetPaths.player.data
    });
    
    // Monster spritesheets
    for (const [key, monster] of Object.entries(this.assetPaths.monsters))
    {
      assets.push({
        alias: `${key}_spritesheet`,
        src: monster.data
      });
    }
    
    // Clouds spritesheet
    assets.push({
      alias: 'clouds_spritesheet',
      src: this.assetPaths.clouds.data
    });

    // Powers spritesheet
    assets.push({
      alias: 'powers_spritesheet',
      src: this.assetPaths.powers.data
    });

    // Collectables spritesheet
    assets.push({
      alias: 'collectables_spritesheet',
      src: this.assetPaths.collectables.data
    });
    
    // Light background textures (plain images, no JSON)
    for (const [key, path] of Object.entries(this.assetPaths.backgrounds.light))
    {
      if (key !== 'backgroundColor')
      {
        assets.push({
          alias: `bg_light_${key}`,
          src: path
        });
      }
    }
    
    // Dark background textures (plain images, no JSON)
    for (const [key, path] of Object.entries(this.assetPaths.backgrounds.dark))
    {
      if (key !== 'backgroundColor')
      {
        assets.push({
          alias: `bg_dark_${key}`,
          src: path
        });
      }
    }
    
    // UI assets (plain images)
    assets.push(
      { alias: 'avatar', src: this.assetPaths.ui.avatar },
      { alias: 'github_logo', src: this.assetPaths.ui.github },
      { alias: 'linkedin_logo', src: this.assetPaths.ui.linkedin },
      { alias: 'cursor_light', src: this.assetPaths.ui.cursors.light },
      { alias: 'cursor_night', src: this.assetPaths.ui.cursors.dark }
    );
    
    return {
      bundles: [
        {
          name: 'game-assets',
          assets: assets
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
      // Skip file paths (contain '/')
      if (alias.includes('/'))
      {
        continue;
      }
      
      // Skip bundle-prefixed aliases
      if (alias.includes('-'))
      {
        continue;
      }
      
      if (asset instanceof Texture)
      {
        this.textures.set(alias, asset);
      }
      else if (asset instanceof Spritesheet)
      {
        this.spritesheets.set(alias, asset);
      }
    }
    
    console.log(`✅ Loaded bundle: ${bundleName} (${this.textures.size} textures, ${this.spritesheets.size} spritesheets)`);
  }
  
  /**
   * Process spritesheets after loading
   */
  private async processSpritesheets(): Promise<void>
  {
    const spritesheetAliases = [
      'player_spritesheet',
      'clouds_spritesheet',
      ...Object.keys(this.assetPaths.monsters).map(key => `${key}_spritesheet`),
      'powers_spritesheet',
      'collectables_spritesheet'
    ];
    
    for (const alias of spritesheetAliases)
    {
      if (!this.spritesheets.has(alias))
      {
        console.warn(`Spritesheet ${alias} not found in loaded assets`);
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
      this.onProgress(clampedProgress / 100);
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
   * Get a specific frame from a spritesheet by frame name
   */
  getSpriteFrame(spritesheetAlias: string, frameName: string): Texture | null
  {
    const spritesheet = this.getSpritesheet(spritesheetAlias);
    if (spritesheet && spritesheet.textures && spritesheet.textures[frameName])
    {
      return spritesheet.textures[frameName];
    }
    
    console.warn(`Frame "${frameName}" not found in spritesheet: ${spritesheetAlias}`);
    return null;
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
    const colorHex = theme === 'light' 
      ? this.assetPaths.backgrounds.light.backgroundColor 
      : this.assetPaths.backgrounds.dark.backgroundColor;
    
    return parseInt(colorHex.replace('#', ''), 16);
  }
  
  /**
   * Check if assets are loaded
   */
  isAssetsLoaded(): boolean
  {
    return this.isLoaded;
  }
  
  /**
   * Get asset paths configuration
   */
  getAssetPaths(): AssetPaths
  {
    return this.assetPaths;
  }
}