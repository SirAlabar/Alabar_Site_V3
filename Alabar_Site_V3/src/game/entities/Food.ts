/**
 * Food/Healing pickup entity
 */

import { Container, Text } from 'pixi.js';
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
      magnetRadius: config.magnetRadius ?? 75,
      magnetSpeed: config.magnetSpeed ?? 3.0,
      lifetime: config.lifetime ?? 0, // Infinite by default
      particleContainer: config.particleContainer
    };
    
    super(assetManager, pickupConfig);
    
    this.tier = config.tier;
    this.healPercent = healPercent;
    
    // Scale food items slightly
    this.scale.set(0.9, 0.9);
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
      
      // Spawn floating heal number
      this.spawnFloatingNumber(amount, 0x4AFF88, '+');
      
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
      
      // Spawn floating damage number
      this.spawnFloatingNumber(amount, 0xFF4A4A, '-');
      
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
   * Spawn floating number that fades upward
   */
  private spawnFloatingNumber(amount: number, color: number, prefix: string = ''): void
  {
    if (!this.particleContainer)
    {
      return;
    }
    
    // Create text
    const text = new Text({
      text: `${prefix}${amount}`,
      style: {
        fontFamily: 'VT323',
        fontSize: 32,
        fill: color,
        stroke: { color: 0x000000, width: 3 },
        align: 'center',
        fontWeight: 'bold'
      }
    });
    
    text.anchor.set(0.5);
    text.x = this.position.x;
    text.y = this.position.y - 20; // Start slightly above pickup
    
    this.particleContainer.addChild(text);
    
    // Animation properties
    let life = 150; // 2.5 seconds at 60fps
    const initialLife = life;
    const floatSpeed = 1.0; // Slower float
    
    // Animate
    const animate = () =>
    {
      // Move upward
      text.y -= floatSpeed;
      
      // Fade out (stays visible longer, then fades quickly at end)
      life--;
      const lifeRatio = life / initialLife;
      
      // Better fade curve - stays at full opacity for first 40%, then fades
      let alpha = 1.0;
      if (lifeRatio < 0.6)
      {
        alpha = lifeRatio / 0.6; // Fade out in last 60%
      }
      text.alpha = Math.max(0, alpha);
      
      // Scale up slightly
      const scale = 1.0 + (1 - lifeRatio) * 0.3;
      text.scale.set(scale);
      
      // Remove when done
      if (life <= 0)
      {
        if (this.particleContainer)
        {
          this.particleContainer.removeChild(text);
        }
        text.destroy();
        return;
      }
      
      // Continue animation
      requestAnimationFrame(animate);
    };
    
    // Start animation
    requestAnimationFrame(animate);
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