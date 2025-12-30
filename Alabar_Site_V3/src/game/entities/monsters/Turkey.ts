/**
 * Turkey.ts - Passive creature that drops food when killed
 * Only has walk/idle animations (no combat animations)
 */

import { Texture } from 'pixi.js';
import { AssetManager } from '../../../managers/AssetManager';
import { MonsterBase, MonsterConfig, MonsterBehavior } from './MonsterBase';
import { FacingDirection } from '../BaseEntity';

export class Turkey extends MonsterBase
{
  constructor(assetManager: AssetManager, x: number, y: number)
  {
    const config: MonsterConfig = {
      startX: x,
      startY: y,
      speed: 1.6, // Slower than combat monsters
      spritesheetKey: 'turkey_spritesheet',
      animationPrefix: 'Turkey',
      health: 40, // Low health - easy to kill
      damage: 0, // Passive - doesn't attack
      attackRange: 0, // No attack
      detectionRange: 0 // Doesn't chase player
    };
    
    super(assetManager, config);
    
    // Turkeys are passive roaming creatures
    this.behavior = MonsterBehavior.ROAMING;
    
    // Start with random facing direction
    const directions: FacingDirection[] = ['Front', 'Back', 'Left', 'Right'];
    this.facingDirection = directions[Math.floor(Math.random() * directions.length)];
    
    // Start walking animation
    this.playAnimation('walk', this.facingDirection, {
      loop: true,
      speed: 0.12
    });
    
    if (this.sprite)
    {
      this.sprite.scale.set(0.5, 0.5);
    }
  }
  
  /**
   * Override getAnimationFrames to map run -> walk
   * Turkey only has walk/idle animations (no combat animations)
   */
  protected getAnimationFrames(state: string, direction: FacingDirection): Texture[]
  {
    // Map combat animations to available animations
    let actualState = state;
    
    if (state === 'run')
    {
      actualState = 'walk'; // Map run to walk
    }
    else if (state === 'atk' || state === 'hurt' || state === 'death')
    {
      actualState = 'idle'; // Map combat animations to idle
    }
    
    return super.getAnimationFrames(actualState, direction);
  }
  
  /**
   * Override onDeath to spawn food drops
   * This will be called by MonsterBase when health reaches 0
   */
  protected onDeath(): void
  {
    // Call parent to play death animation (which maps to idle)
    super.onDeath();
    
    // Emit death event for drop system
    // SiteGame will listen for 'drop-food' event and spawn food
    this.emit('drop-food', {
      x: this.currentPosition.x,
      y: this.currentPosition.y,
      monsterType: 'turkey'
    });
  }
  
  /**
   * Override onHurt - turkeys don't have hurt animation
   */
  protected onHurt(): void
  {
    // Skip hurt animation - just keep walking/idling
    // No stagger effect for passive creatures
  }
  
  /**
   * AI Decision: Simple roaming behavior
   * Turkeys just wander around randomly
   */
  protected makeAIDecision(delta: number): void
  {
    // Turkeys are passive - no chasing or attacking
    if (this.behavior !== MonsterBehavior.ROAMING)
    {
      this.behavior = MonsterBehavior.ROAMING;
    }
    
    // Simple random movement
    this.roam(delta);
  }
  
  /**
   * Simple roaming logic - move in random direction
   */
  private roam(delta: number): void
  {
    // Change direction randomly every ~2 seconds
    if (Math.random() < 0.01)
    {
      const directions: FacingDirection[] = ['Front', 'Back', 'Left', 'Right'];
      this.facingDirection = directions[Math.floor(Math.random() * directions.length)];
      
      // 30% chance to stop and idle
      if (Math.random() < 0.4)
      {
        this.playAnimation('idle', this.facingDirection, {
          loop: true,
          speed: 0.08
        });
        this.moveDirection = { x: 0, y: 0 };
        return;
      }
      
      // Start walking in new direction
      this.playAnimation('walk', this.facingDirection, {
        loop: true,
        speed: 0.12
      });
    }
    
    // Move if not idling
    if (this.sprite && this.sprite.playing)
    {
      // Convert facing direction to movement vector
      const directionMap: Record<FacingDirection, { x: number; y: number }> = {
        'Front': { x: 0, y: 1 },
        'Back': { x: 0, y: -1 },
        'Left': { x: -1, y: 0 },
        'Right': { x: 1, y: 0 }
      };
      
      this.moveDirection = directionMap[this.facingDirection];
      
      // Apply movement with delta time
      const speed = this.movementSystem.getSpeed();
      const scaledSpeed = speed * delta * 60;
      const dx = this.moveDirection.x * scaledSpeed;
      const dy = this.moveDirection.y * scaledSpeed;
      
      // Apply bounds checking
      const bounds = this.movementSystem.getBounds();
      const newX = bounds ? Math.max(
        bounds.minX,
        Math.min(bounds.maxX, this.currentPosition.x + dx)
      ) : this.currentPosition.x + dx;
      
      const newY = bounds ? Math.max(
        bounds.minY,
        Math.min(bounds.maxY, this.currentPosition.y + dy)
      ) : this.currentPosition.y + dy;
      
      this.setPosition(newX, newY);
    }
  }
  
  /**
   * Override collision radius for Turkey
   */
  getCollisionRadius(): number
  {
    return 25; // Similar to other monsters
  }
}