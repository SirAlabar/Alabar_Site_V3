/**
 * XP Crystal pickup entity
 * 10 tiers with different XP values and sprites
 */

import { Container } from 'pixi.js';
import { AssetManager } from '../../managers/AssetManager';
import { PickupBase, PickupConfig } from './PickupBase';
import { Player } from './Player';

export interface CrystalPickupConfig
{
  x: number;
  y: number;
  tier: number; // 1-10
  xpValue: number;
  magnetRadius?: number;
  magnetSpeed?: number;
  lifetime?: number;
  particleContainer?: Container;
}

export class CrystalPickup extends PickupBase
{
  private tier: number;
  private xpValue: number;
  
  constructor(assetManager: AssetManager, config: CrystalPickupConfig)
  {
    // Validate tier
    if (config.tier < 1 || config.tier > 10)
    {
      console.error(`[CrystalPickup] Invalid tier: ${config.tier}. Must be 1-10.`);
      config.tier = 1;
    }
    
    // Map tier to spritesheet/frame
    const { spritesheetKey, frameName } = CrystalPickup.getTierSpriteInfo(config.tier);
    
    // Create base pickup config
    const pickupConfig: PickupConfig = {
      x: config.x,
      y: config.y,
      spritesheetKey: spritesheetKey,
      frameName: frameName, // Static frame
      magnetRadius: config.magnetRadius ?? 75,
      magnetSpeed: config.magnetSpeed ?? 2.5,
      lifetime: config.lifetime ?? 0, // Infinite by default
      particleContainer: config.particleContainer
    };
    
    super(assetManager, pickupConfig);
    
    this.tier = config.tier;
    this.xpValue = config.xpValue;
    
    // Scale crystals slightly
    this.scale.set(0.5, 0.5);
  }
  
  /**
   * Get spritesheet and frame name for a given tier
   * Uses static frames: Gems_Blue, Gems_Green, Gems_Gray, etc.
   */
  private static getTierSpriteInfo(tier: number): { spritesheetKey: string; frameName: string }
  {
    const colorMap: Record<number, string> = {
      1: 'Blue',    // Low tier - common (1 XP)
      2: 'Green',   // 2 XP
      3: 'Gray',    // 3 XP
      4: 'Red',     // 5 XP
      5: 'Dark',    // Mid tier (7 XP)
      6: 'White',   // 10 XP
      7: 'Purple',  // 15 XP
      8: 'Pink',    // High tier (20 XP)
      9: 'Brown',   // 25 XP
      10: 'Tan'     // Highest tier - rare (30 XP)
    };
    
    const color = colorMap[tier] || 'Blue';
    
    return {
      spritesheetKey: 'collectables_spritesheet',
      frameName: `Gems_${color}` // e.g., "Gems_Blue", "Gems_Red"
    };
  }
  
  /**
   * Called when player picks up this crystal
   */
  onPickup(player: Player): void
  {
    if (this.wasPickedUp())
    {
      return;
    }
    
    // Add XP to player
    player.addXP(this.xpValue);
    
    // Mark as picked up
    this.markAsPickedUp();
    
    // Spawn subtle burst particles 
    const color = this.getGemColorHex(this.tier);
    this.spawnBurstParticles(5, color, ['circle']);
    
    console.log(`[CrystalPickup] Collected Tier ${this.tier} crystal (+${this.xpValue} XP)`);
  }
  
  /**
   * Get color hex for gem tier
   */
  private getGemColorHex(tier: number): number
  {
    const colorMap: Record<number, number> = {
      1: 0x4A9EFF,  // Blue
      2: 0x4AFF88,  // Green
      3: 0xA0A0A0,  // Gray
      4: 0xFF4A4A,  // Red
      5: 0x2A2A3E,  // Dark
      6: 0xFFFFFF,  // White
      7: 0xB84AFF,  // Purple
      8: 0xFFB4E8,  // Pink
      9: 0x8B5A3C,  // Brown
      10: 0xD4A76A  // Tan
    };
    
    return colorMap[tier] || 0x4A9EFF;
  }
  
  /**
   * Get crystal tier
   */
  getTier(): number
  {
    return this.tier;
  }
  
  /**
   * Get XP value
   */
  getXPValue(): number
  {
    return this.xpValue;
  }
  
  /**
   * Override collision radius
   */
  getPickupRadius(): number
  {
    return 25;
  }
}