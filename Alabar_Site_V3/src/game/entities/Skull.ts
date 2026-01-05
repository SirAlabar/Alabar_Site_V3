/**
 * Skull.ts - Screen-clear bomb powerup pickup
 * Instantly kills all monsters on screen when collected
 */

import { Container } from 'pixi.js';
import { AssetManager } from '../../managers/AssetManager';
import { PickupBase, PickupConfig } from './PickupBase';
import { Player } from './Player';

export interface SkullPickupConfig
{
  x: number;
  y: number;
  damage?: number; // Damage dealt to all monsters (default: instant kill)
  magnetRadius?: number;
  magnetSpeed?: number;
  lifetime?: number;
  particleContainer?: Container;
}

export class SkullPickup extends PickupBase
{
  private damage: number;
  
  constructor(assetManager: AssetManager, config: SkullPickupConfig)
  {
    // Create base pickup config with animated Skull sprite
    const pickupConfig: PickupConfig = {
      x: config.x,
      y: config.y,
      spritesheetKey: 'collectables_spritesheet',
      animationName: 'Skull', // Use animated skull (12 frames)
      magnetRadius: config.magnetRadius ?? 100, // Larger magnet radius for rare drops
      magnetSpeed: config.magnetSpeed ?? 4.0, // Faster magnet speed
      lifetime: config.lifetime ?? 0, // Permanent by default (rare drops don't expire)
      particleContainer: config.particleContainer
    };
    
    super(assetManager, pickupConfig);
    
    this.damage = config.damage ?? 9999; // Instant kill by default
    
    // Scale skull slightly larger (it's a rare drop!)
    this.scale.set(1, 1);
    
    // Add ominous pulsing effect
    this.addPulseEffect();
  }
  
  /**
   * Add pulsing effect to make rare drop stand out
   */
  private addPulseEffect(): void
  {
    let time = 0;
    const pulseSpeed = 0.06; // Slightly faster than star
    const pulseAmount = 0.12; // Slightly more dramatic
    
    // Simple pulse animation (will be called in update loop)
    const pulse = (delta: number) => {
      time += delta * pulseSpeed;
      const scale = 1 + Math.sin(time) * pulseAmount;
      this.scale.set(scale, scale);
    };
    
    // Store pulse function for update
    (this as any).pulseEffect = pulse;
  }
  
  /**
   * Override update to add pulse effect
   */
  update(delta: number, _playerPos?: { x: number; y: number }): void
  {
    super.update(delta);
    
    // Apply pulse effect
    if ((this as any).pulseEffect && !this.wasPickedUp())
    {
      (this as any).pulseEffect(delta);
    }
  }
  
  /**
   * Called when player picks up this skull
   */
  onPickup(_player: Player): void
  {
    if (this.wasPickedUp())
    {
      return;
    }
    
    // Mark as picked up FIRST (before triggering screen clear)
    this.markAsPickedUp();
    
    // Emit screen-clear event for game to handle
    // SiteGame will listen for 'screen-clear' event and damage all monsters
    this.emit('screen-clear', {
      x: this.x,
      y: this.y,
      damage: this.damage
    });
    
    // Spawn dramatic explosion particles (red/purple/dark)
    this.spawnBurstParticles(
      30, // More particles than star
      0xFF4A4A, // Red color
      ['circle', 'square', 'diamond', 'star']
    );
    
    // Additional purple burst
    this.spawnBurstParticles(
      20,
      0x8B4AFF, // Purple color
      ['circle', 'triangle', 'diamond']
    );
    
    console.log(`[SkullPickup] SCREEN CLEAR ACTIVATED! Damage: ${this.damage}`);
  }
  
  /**
   * Get damage dealt to monsters
   */
  getDamage(): number
  {
    return this.damage;
  }
  
  /**
   * Override collision radius (slightly larger for rare drops)
   */
  getPickupRadius(): number
  {
    return 35;
  }
}