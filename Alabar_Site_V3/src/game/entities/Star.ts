/**
 * Star.ts - Invincibility powerup pickup
 * Grants temporary invulnerability to damage
 */

import { Container } from 'pixi.js';
import { AssetManager } from '../../managers/AssetManager';
import { PickupBase, PickupConfig } from './PickupBase';
import { Player } from './Player';

export interface StarPickupConfig
{
  x: number;
  y: number;
  duration?: number;
  magnetRadius?: number;
  magnetSpeed?: number;
  lifetime?: number;
  particleContainer?: Container;
}

export class StarPickup extends PickupBase
{
  private invincibilityDuration: number;
  private spawnImmunity: number = 60; // 60 frames = 1 second
  
  constructor(assetManager: AssetManager, config: StarPickupConfig)
  {
    const pickupConfig: PickupConfig = {
      x: config.x,
      y: config.y,
      spritesheetKey: 'collectables_spritesheet',
      animationName: 'Star',
      magnetRadius: config.magnetRadius ?? 100,
      magnetSpeed: config.magnetSpeed ?? 4.0,
      lifetime: config.lifetime ?? 0,
      particleContainer: config.particleContainer
    };
    
    super(assetManager, pickupConfig);
    
    this.invincibilityDuration = config.duration ?? 8.0;
    this.spawnImmunity = 60; // Can't be picked up for 1 second
    
    // Scale container like Crystal/Food
    this.scale.set(0.8, 0.8);
  }
  
  /**
   * Override update to count down spawn immunity
   */
  update(delta: number): void
  {
    // Count down spawn immunity
    if (this.spawnImmunity > 0)
    {
      this.spawnImmunity--;
    }
    
    // Call parent update
    super.update(delta);
  }
  
  /**
   * Called when player picks up this star
   */
  onPickup(player: Player): void
  {
    // Block pickup during spawn immunity
    if (this.spawnImmunity > 0)
    {
      return;
    }
    
    if (this.wasPickedUp())
    {
      return;
    }
    
    // Activate invincibility on player
    if ('activateInvincibility' in player && typeof (player as any).activateInvincibility === 'function')
    {
      (player as any).activateInvincibility(this.invincibilityDuration);
    }
    else
    {
      console.warn('[StarPickup] Player does not have activateInvincibility method!');
    }
    
    // Mark as picked up
    this.markAsPickedUp();
    
    // Spawn dramatic burst particles (golden/yellow)
    this.spawnBurstParticles(
      20,
      0xFFD700,
      ['star', 'circle', 'diamond']
    );
  }
  
  /**
   * Get invincibility duration
   */
  getDuration(): number
  {
    return this.invincibilityDuration;
  }
  
  /**
   * Override collision radius (slightly larger for rare drops)
   */
  getPickupRadius(): number
  {
    return 35;
  }
}