/**
 * LevelUpCard.ts - Level-up card selection UI
 * Displays 3 cards with animated icons, stats, and descriptions
 */

import { Container, Graphics, Text, AnimatedSprite } from 'pixi.js';
import { PowerUp } from './PowerUps';
import { AssetManager } from '../../managers/AssetManager';

export interface LevelUpCardConfig
{
  powerUp: PowerUp;
  isNew: boolean;
  x: number;
  y: number;
  onSelect: () => void;
}

export class LevelUpCard extends Container
{
  private powerUp: PowerUp;
  private isNew: boolean;
  private assetManager: AssetManager;
  
  // UI elements
  private background!: Graphics;
  private icon: AnimatedSprite | null = null;
  private nameText!: Text;
  private levelText!: Text;
  private descriptionText!: Text;
  private statsText!: Text;
  
  // Interaction
  private onSelectCallback: () => void;
  
  // Dimensions
  private readonly CARD_WIDTH = 280;
  private readonly CARD_HEIGHT = 380;
  
  constructor(assetManager: AssetManager, config: LevelUpCardConfig)
  {
    super();
    
    this.assetManager = assetManager;
    this.powerUp = config.powerUp;
    this.isNew = config.isNew;
    this.onSelectCallback = config.onSelect;
    
    this.position.set(config.x, config.y);
    
    // Create UI elements
    this.createBackground();
    this.createIcon();
    this.createTexts();
    
    // Enable interaction
    this.eventMode = 'static';
    this.cursor = 'pointer';
    
    // Add hover effects
    this.on('pointerover', this.onPointerOver.bind(this));
    this.on('pointerout', this.onPointerOut.bind(this));
    this.on('pointerdown', this.onPointerDown.bind(this));
  }
  
  /**
   * Create card background
   */
  private createBackground(): void
  {
    this.background = new Graphics();
    this.drawBackground(false);
    this.addChild(this.background);
  }
  
  /**
   * Draw background (normal or hovered)
   */
  private drawBackground(hovered: boolean): void
  {
    this.background.clear();
    
    // Background color based on rarity
    let bgColor = 0x2a2a3e; // Common
    let borderColor = 0x4a4a6e;
    
    if (this.powerUp.rarity === "uncommon")
    {
      bgColor = 0x2e3a2e;
      borderColor = 0x4a6e4a;
    }
    else if (this.powerUp.rarity === "rare")
    {
      bgColor = 0x3a2e3a;
      borderColor = 0x6e4a6e;
    }
    
    // Hover effect
    if (hovered)
    {
      bgColor = this.lightenColor(bgColor, 0.2);
      borderColor = this.lightenColor(borderColor, 0.3);
    }
    
    // Draw card
    this.background.rect(0, 0, this.CARD_WIDTH, this.CARD_HEIGHT);
    this.background.fill(bgColor);
    
    // Border
    this.background.rect(0, 0, this.CARD_WIDTH, this.CARD_HEIGHT);
    this.background.stroke({ width: 3, color: borderColor });
    
    // Rarity indicator (top border)
    if (this.powerUp.rarity === "rare")
    {
      this.background.rect(0, 0, this.CARD_WIDTH, 6);
      this.background.fill(0xffcc33);
    }
  }
  
  /**
   * Lighten color for hover effect
   */
  private lightenColor(color: number, amount: number): number
  {
    const r = Math.min(255, ((color >> 16) & 0xFF) + amount * 255);
    const g = Math.min(255, ((color >> 8) & 0xFF) + amount * 255);
    const b = Math.min(255, (color & 0xFF) + amount * 255);
    
    return (r << 16) | (g << 8) | b;
  }
  
  /**
   * Create animated icon
   */
  private createIcon(): void
  {
    const spritesheet = this.assetManager.getSpritesheet('powers_spritesheet');
    
    if (!spritesheet)
    {
      console.error('[LevelUpCard] Powers spritesheet not found');
      return;
    }
    
    // For animated powers, show looping animation
    if (this.powerUp.hasLeveledAnimations)
    {
      const animationName = this.powerUp.getAnimationName();
      const frames = spritesheet.animations[animationName];
      
      if (frames && frames.length > 0)
      {
        this.icon = new AnimatedSprite(frames);
        this.icon.animationSpeed = 0.15;
        this.icon.loop = true;
        this.icon.play();
      }
    }
    else
    {
      // Static icon
      const frameName = this.powerUp.getIconFrame();
      const texture = spritesheet.textures[frameName];
      
      if (texture)
      {
        this.icon = new AnimatedSprite([texture]);
      }
    }
    
    if (this.icon)
    {
      // Center icon in card
      this.icon.anchor.set(0.5);
      this.icon.position.set(this.CARD_WIDTH / 2, 80);
      
      // Scale to fit
      const scale = Math.min(64 / this.icon.width, 64 / this.icon.height);
      this.icon.scale.set(scale);
      
      this.addChild(this.icon);
    }
  }
  
  /**
   * Create text elements
   */
  private createTexts(): void
  {
    // Name
    this.nameText = new Text({
      text: this.powerUp.name,
      style: {
        fontFamily: 'VT323',
        fontSize: 24,
        fill: 0xffcc33,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: this.CARD_WIDTH - 20
      }
    });
    this.nameText.anchor.set(0.5, 0);
    this.nameText.position.set(this.CARD_WIDTH / 2, 140);
    this.addChild(this.nameText);
    
    // Level indicator
    const levelLabel = this.isNew ? "NEW" : this.powerUp.getLevelText();
    this.levelText = new Text({
      text: levelLabel,
      style: {
        fontFamily: 'VT323',
        fontSize: 18,
        fill: this.isNew ? 0x4AFF88 : 0xe0e0e0,
        align: 'center'
      }
    });
    this.levelText.anchor.set(0.5, 0);
    this.levelText.position.set(this.CARD_WIDTH / 2, 170);
    this.addChild(this.levelText);
    
    // Description
    this.descriptionText = new Text({
      text: this.powerUp.description,
      style: {
        fontFamily: 'VT323',
        fontSize: 16,
        fill: 0xe0e0e0,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: this.CARD_WIDTH - 30
      }
    });
    this.descriptionText.anchor.set(0.5, 0);
    this.descriptionText.position.set(this.CARD_WIDTH / 2, 200);
    this.addChild(this.descriptionText);
    
    // Stats preview
    this.statsText = new Text({
      text: this.getStatsPreview(),
      style: {
        fontFamily: 'VT323',
        fontSize: 14,
        fill: 0x4AFF88,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: this.CARD_WIDTH - 30
      }
    });
    this.statsText.anchor.set(0.5, 0);
    this.statsText.position.set(this.CARD_WIDTH / 2, 300);
    this.addChild(this.statsText);
  }
  
  /**
   * Get stats preview text
   */
  private getStatsPreview(): string
  {
    if (this.powerUp.level === 0)
    {
      // New power-up
      const stats: string[] = [];
      
      if (this.powerUp.damagePerLevel.length > 0)
      {
        stats.push(`Damage: ${Math.floor(this.powerUp.damagePerLevel[0])}`);
      }
      
      if (this.powerUp.cooldownPerLevel.length > 0)
      {
        stats.push(`Cooldown: ${this.powerUp.cooldownPerLevel[0].toFixed(1)}s`);
      }
      
      return stats.join('\n');
    }
    else
    {
      // Upgrade existing
      const stats: string[] = [];
      
      if (this.powerUp.damagePerLevel.length > 0)
      {
        const current = Math.floor(this.powerUp.getCurrentDamage());
        const next = Math.floor(this.powerUp.getNextDamage());
        stats.push(`Damage: ${current} → ${next}`);
      }
      
      if (this.powerUp.cooldownPerLevel.length > 0)
      {
        const current = this.powerUp.getCurrentCooldown().toFixed(1);
        const next = this.powerUp.getNextCooldown().toFixed(1);
        stats.push(`Cooldown: ${current}s → ${next}s`);
      }
      
      if (this.powerUp.radiusPerLevel.length > 0)
      {
        const current = Math.floor(this.powerUp.getCurrentRadius());
        const next = Math.floor(this.powerUp.getNextRadius());
        stats.push(`Radius: ${current} → ${next}`);
      }
      
      return stats.join('\n');
    }
  }
  
  /**
   * Hover handlers
   */
  private onPointerOver(): void
  {
    this.drawBackground(true);
    
    // Scale up slightly
    this.scale.set(1.05);
  }
  
  private onPointerOut(): void
  {
    this.drawBackground(false);
    
    // Reset scale
    this.scale.set(1.0);
  }
  
  /**
   * Click handler
   */
  private onPointerDown(): void
  {
    console.log(`[LevelUpCard] Selected: ${this.powerUp.name}`);
    this.onSelectCallback();
  }
  
  /**
   * Update animation
   */
  update(_delta: number): void
  {
    // Icon animation is handled automatically by AnimatedSprite
  }
  
  /**
   * Cleanup
   */
  destroy(options?: any): void
  {
    if (this.icon)
    {
      this.icon.destroy();
      this.icon = null;
    }
    
    super.destroy(options);
  }
}