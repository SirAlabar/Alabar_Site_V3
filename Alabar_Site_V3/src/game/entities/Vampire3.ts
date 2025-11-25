/**
 * Vampire3.ts - Vampire monster implementation
 */

import { AssetManager } from '../../managers/AssetManager';
import { MonsterBase, MonsterConfig, MonsterBehavior } from './MonsterBase';
import { EntityState } from './BaseEntity';

export interface Vampire3Config
{
  startX: number;
  startY: number;
  bounds?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export class Vampire3 extends MonsterBase
{
  // Aggressive dash ability
  private dashCooldown: number = 0;
  private readonly DASH_COOLDOWN_MAX: number = 120; // 2 seconds
  private readonly DASH_DISTANCE: number = 60; // Longer dash
  private readonly DASH_CHANCE: number = 0.5; // 50% chance
  
  constructor(assetManager: AssetManager, config: Vampire3Config)
  {
    // Define Vampire3-specific stats
    const monsterConfig: MonsterConfig = {
      startX: config.startX,
      startY: config.startY,
      speed: 1.35, // Fastest vampire!
      spritesheetKey: 'vampire3_spritesheet',
      animationPrefix: 'Vampire3',
      health: 50,
      damage: 8.5,
      attackRange: 40,
      detectionRange: 4000, // Longer detection
      bounds: config.bounds
    };
    
    super(assetManager, monsterConfig);
    
    // Very short attack cooldown
    this.attackCooldownMax = 60; // 1 second
  }
  
  /**
   * Perform aggressive micro-dash towards target
   */
  private performDash(): void
  {
    if (!this.target || this.dashCooldown > 0)
    {
      return;
    }
    
    const direction = this.getDirectionToTarget();
    const distance = this.getDistanceToTarget();
    
    // Dash at any medium-to-long range
    if (distance > 80 && distance < 500)
    {
      // High chance to dash
      if (Math.random() < this.DASH_CHANCE)
      {
        console.log('[Vampire3] Performing AGGRESSIVE DASH!');
        
        // Apply dash movement
        const dashX = this.currentPosition.x + (direction.x * this.DASH_DISTANCE);
        const dashY = this.currentPosition.y + (direction.y * this.DASH_DISTANCE);
        
        // Apply bounds
        const bounds = this.movementSystem.getBounds();
        const newX = bounds ? Math.max(bounds.minX, Math.min(bounds.maxX, dashX)) : dashX;
        const newY = bounds ? Math.max(bounds.minY, Math.min(bounds.maxY, dashY)) : dashY;
        
        this.setPosition(newX, newY);
        
        // Set cooldown
        this.dashCooldown = this.DASH_COOLDOWN_MAX;
      }
    }
  }
  
  /**
   * Update dash cooldown
   */
  private updateDashCooldown(): void
  {
    if (this.dashCooldown > 0)
    {
      this.dashCooldown--;
    }
  }
  
  /**
   * Vampire3 AI decision logic
   */
  protected makeAIDecision(): void
  {
    // Can't make decisions while attacking
    if (this.currentState === EntityState.ATTACKING)
    {
      return;
    }
    
    // Update dash cooldown
    this.updateDashCooldown();
    
    // No target = idle
    if (!this.target)
    {
      if (this.behavior !== MonsterBehavior.IDLE)
      {
        this.transitionToIdle();
      }
      return;
    }
    
    // Check if target is in attack range
    if (this.isTargetInAttackRange())
    {
      // Attack if cooldown is ready
      if (this.canAttack())
      {
        this.transitionToAttacking();
      }
      else
      {
        // Wait for cooldown while facing target
        if (this.behavior !== MonsterBehavior.IDLE)
        {
          this.transitionToIdle();
        }
      }
    }
    // Check if target is in detection range
    else if (this.isTargetInDetectionRange())
    {
      // Chase the target aggressively
      if (this.behavior !== MonsterBehavior.CHASING)
      {
        this.transitionToChasing();
      }
      
      // Frequently attempt dash while chasing
      this.performDash();
    }
    // Target out of range
    else
    {
      // Return to idle
      if (this.behavior !== MonsterBehavior.IDLE)
      {
        this.transitionToIdle();
      }
    }
  }
}
