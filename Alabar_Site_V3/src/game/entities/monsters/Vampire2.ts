/**
 * Vampire2.ts - Vampire monster implementation
 */

import { AssetManager } from '../../../managers/AssetManager';
import { MonsterBase, MonsterConfig, MonsterBehavior } from './MonsterBase';
import { EntityState } from '../BaseEntity';

export interface Vampire2Config
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

export class Vampire2 extends MonsterBase
{
  // Dash ability
  private dashCooldown: number = 0;
  private readonly DASH_COOLDOWN_MAX: number = 3; // 3 seconds
  private readonly DASH_DISTANCE: number = 50;
  private readonly DASH_CHANCE: number = 0.3; // 30% chance when in range
  
  // Dash system
  private isDashing: boolean = false;
  private dashVelocityX: number = 0;
  private dashVelocityY: number = 0;
  private dashTimeRemaining: number = 0;
  private readonly DASH_DURATION: number = 0.13; // 0.13 seconds
  
  constructor(assetManager: AssetManager, config: Vampire2Config)
  {
    // Define Vampire2-specific stats
    const monsterConfig: MonsterConfig = {
      startX: config.startX,
      startY: config.startY,
      speed: 1.25,
      spritesheetKey: 'vampire2_spritesheet',
      animationPrefix: 'Vampire2',
      health: 52,
      damage: 7,
      attackRange: 40,
      detectionRange: 3500,
      bounds: config.bounds
    };
    
    super(assetManager, monsterConfig);
    
    // Attack cooldown
    this.attackCooldownMax = 1.17; // 1.17 seconds
  }
  
  /**
   * Update dash movement
   */
  private updateDash(delta: number): void
  {
    if (!this.isDashing)
    {
      return;
    }
    
    // Apply dash velocity scaled by delta (velocity is in units per second)
    const newX = this.currentPosition.x + (this.dashVelocityX * delta);
    const newY = this.currentPosition.y + (this.dashVelocityY * delta);
    
    // Apply bounds
    const bounds = this.movementSystem.getBounds();
    const boundedX = bounds ? Math.max(bounds.minX, Math.min(bounds.maxX, newX)) : newX;
    const boundedY = bounds ? Math.max(bounds.minY, Math.min(bounds.maxY, newY)) : newY;
    
    this.setPosition(boundedX, boundedY);
    
    // Decrease remaining time using delta
    this.dashTimeRemaining -= delta;
    
    // Check if dash is complete
    if (this.dashTimeRemaining <= 0)
    {
      this.isDashing = false;
      this.dashVelocityX = 0;
      this.dashVelocityY = 0;
    }
  }
  
  /**
   * Perform micro-dash towards target
   */
  private performDash(): void
  {
    if (!this.target || this.dashCooldown > 0 || this.isDashing)
    {
      return;
    }
    
    const direction = this.getDirectionToTarget();
    const distance = this.getDistanceToTarget();
    
    // Only dash if target is in medium range
    if (distance > 100 && distance < 400)
    {
      // Random chance to dash
      if (Math.random() < this.DASH_CHANCE)
      {
        console.log('[Vampire2] Performing DASH!');
        
        // Calculate velocity in units per second
        // Velocity = Distance / Time
        this.dashVelocityX = (direction.x * this.DASH_DISTANCE) / this.DASH_DURATION;
        this.dashVelocityY = (direction.y * this.DASH_DISTANCE) / this.DASH_DURATION;
        
        // Start dash
        this.isDashing = true;
        this.dashTimeRemaining = this.DASH_DURATION;
        
        // Increase animation speed during dash
        if (this.sprite && this.sprite.animationSpeed)
        {
          this.sprite.animationSpeed = 0.35; // Faster animation during dash
        }
        
        // Set cooldown
        this.dashCooldown = this.DASH_COOLDOWN_MAX;
      }
    }
  }
  
  /**
   * Update dash cooldown
   */
  private updateDashCooldown(delta: number): void
  {
    if (this.dashCooldown > 0)
    {
      this.dashCooldown -= delta;
      if (this.dashCooldown < 0)
      {
        this.dashCooldown = 0;
      }
    }
  }
  
  /**
   * Vampire2 AI decision logic
   */
  protected makeAIDecision(delta: number): void
  {
    // Update dash first
    this.updateDash(delta);
    
    // Reset animation speed when not dashing
    if (!this.isDashing && this.sprite && this.sprite.animationSpeed !== 0.125)
    {
      this.sprite.animationSpeed = 0.125;
    }
    
    // Can't make decisions while attacking or dashing
    if (this.currentState === EntityState.ATTACKING || this.isDashing)
    {
      return;
    }
    
    // Update dash cooldown
    this.updateDashCooldown(delta);
    
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
      // Chase the target
      if (this.behavior !== MonsterBehavior.CHASING)
      {
        this.transitionToChasing();
      }
      
      // Attempt dash while chasing
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