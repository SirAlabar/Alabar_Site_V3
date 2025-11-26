/**
 * Food/Healing pickup entity
 */

import { Container } from 'pixi.js';
import { AssetManager } from '../../managers/AssetManager';
import { PickupBase, PickupConfig } from './PickupBase';
import { Player } from './Player';

export type FoodTier = 'bacon' | 'ribs' | 'steak' | 'chiken_leg' | 'eggs' | 'worm';

export interface FoodPickupConfig
{
  x: number;
  y: number;
  tier: FoodTier;
  magnetRadius?: number;
  magnetSpeed?: number;
  lifetime?: number;
  particleContainer?: Container;
}

export class FoodPickup extends PickupBase
{
  private tier: FoodTier;
  private healPercent: number;
  
  constructor(assetManager: AssetManager, config: FoodPickupConfig)
  {
    // Get heal percentage based on tier
    const healPercent = FoodPickup.getHealPercent(config.tier);
    
    // Map tier to spritesheet/frame
    const { spritesheetKey, frameName } = FoodPickup.getTierSpriteInfo(config.tier);
    
    // Create base pickup config
    const pickupConfig: PickupConfig = {
      x: config.x,
      y: config.y,
      spritesheetKey: spritesheetKey,
      frameName: frameName, // Static frame
      magnetRadius: config.magnetRadius ?? 150,
      magnetSpeed: config.magnetSpeed ?? 3.0,
      lifetime: config.lifetime ?? 0, // Infinite by default
      particleContainer: config.particleContainer
    };
    
    super(assetManager, pickupConfig);
    
    this.tier = config.tier;
    this.healPercent = healPercent;
    
    // Scale food items slightly
    this.scale.set(0.5, 0.5);
  }
  
  /**
   * Get heal percentage for a given tier
   * Positive = healing, Negative = damage (poison)
   */
  private static getHealPercent(tier: FoodTier): number
  {
    switch (tier)
    {
      case 'bacon':
        return 0.50; // +50% heal
      case 'ribs':
        return 0.40; // +40% heal
      case 'steak':
        return 0.30; // +30% heal
      case 'chiken_leg':
        return 0.20; // +20% heal
      case 'eggs':
        return 0.10; // +10% heal
      case 'worm':
        return -0.05; // -5% HP (poison - damages player)
      default:
        return 0.10;
    }
  }
  
  /**
   * Get spritesheet and frame name for a given tier
   * Uses static frames from collectables_spritesheet
   */
  private static getTierSpriteInfo(tier: FoodTier): { spritesheetKey: string; frameName: string }
  {
    const frameMap: Record<FoodTier, string> = {
      'bacon': 'Food_Bacon',
      'ribs': 'Food_Ribs',
      'steak': 'Food_Steak',
      'chiken_leg': 'Food_ChickenLeg',
      'eggs': 'Food_Eggs',
      'worm': 'Food_Worm'
    };
    
    return {
      spritesheetKey: 'collectables_spritesheet',
      frameName: frameMap[tier]
    };
  }
  
  /**
   * Called when player picks up this food
   */
  onPickup(player: Player): void
  {
    if (this.wasPickedUp())
    {
      return;
    }
    
    // Calculate heal/damage amount
    const maxHealth = player.getMaxHealth();
    const amount = Math.floor(maxHealth * Math.abs(this.healPercent));
    
    if (this.healPercent > 0)
    {
      // Positive = healing
      player.heal(amount);
      
      // Spawn green burst particles with random shapes
      this.spawnBurstParticles(
        12,
        0x4AFF88, // Green
        ['circle', 'square', 'triangle', 'diamond', 'star']
      );
      
      const healPercentDisplay = Math.floor(this.healPercent * 100);
      console.log(`[FoodPickup] Collected ${this.tier} (+${amount} HP, ${healPercentDisplay}%)`);
    }
    else
    {
      // Negative = damage (poison)
      player.takeDamage(amount);
      
      // Spawn purple burst particles with random shapes
      this.spawnBurstParticles(
        12,
        0x8B4AFF, // Purple
        ['circle', 'square', 'triangle', 'diamond', 'star']
      );
      
      const damagePercentDisplay = Math.floor(Math.abs(this.healPercent) * 100);
      console.log(`[FoodPickup] Ate poisoned ${this.tier}! (-${amount} HP, ${damagePercentDisplay}%)`);
    }
    
    // Mark as picked up
    this.markAsPickedUp();
  }
  
  /**
   * Get food tier
   */
  getTier(): FoodTier
  {
    return this.tier;
  }
  
  /**
   * Get heal percentage
   */
  getHealPercent(): number
  {
    return this.healPercent;
  }
  
  /**
   * Override collision radius
   */
  getPickupRadius(): number
  {
    return 30;
  }
}