/**
 * Orc1.ts - Orc monster implementation
 */

import { AssetManager } from '../../../managers/AssetManager';
import { MonsterBase, MonsterConfig, MonsterBehavior } from './MonsterBase';
import { EntityState } from '../BaseEntity';

export interface Orc1Config
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

export class Orc1 extends MonsterBase
{
  // Heavy behavior properties
  private chargeCooldown: number = 0;
  private readonly CHARGE_COOLDOWN_MAX: number = 4; // 4 seconds
  private readonly CHARGE_RANGE: number = 150; // Will charge when player is close
  private readonly CHARGE_DISTANCE: number = 80;
  private readonly CHARGE_CHANCE: number = 0.4; // 40% chance when in range
  
  // Dash system 
  private isDashing: boolean = false;
  private dashVelocityX: number = 0;
  private dashVelocityY: number = 0;
  private dashTimeRemaining: number = 0;
  private readonly DASH_DURATION: number = 0.25; // 0.25 seconds
  
  constructor(assetManager: AssetManager, config: Orc1Config)
  {
    // Define Orc1-specific stats
    const monsterConfig: MonsterConfig = {
      startX: config.startX,
      startY: config.startY,
      speed: 0.55, // Slow and heavy
      spritesheetKey: 'orc1_spritesheet',
      animationPrefix: 'Orc1',
      health: 110,
      damage: 8,
      attackRange: 40,
      detectionRange: 3000,
      bounds: config.bounds
    };
    
    super(assetManager, monsterConfig);
    
    // attack cooldown
    this.attackCooldownMax = 2; // 2 seconds
  }
  
  /**
   * Update charge cooldown
   */
  private updateChargeCooldown(delta: number): void
  {
    if (this.chargeCooldown > 0)
    {
      this.chargeCooldown -= delta;
      if (this.chargeCooldown < 0)
      {
        this.chargeCooldown = 0;
      }
    }
  }
  
  /**
   * Check if can charge
   */
  private canCharge(): boolean
  {
    return this.chargeCooldown === 0 && 
           this.currentState !== EntityState.ATTACKING &&
           !this.isDashing;
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
      console.log('[Orc1] Dash complete!');
    }
  }
  
  /**
   * Perform short charge towards player
   */
  private performCharge(): void
  {
    if (!this.target || !this.canCharge())
    {
      return;
    }
    
    const distance = this.getDistanceToTarget();
    
    // Only charge when player is close
    if (distance <= this.CHARGE_RANGE && distance > 50)
    {
      // Random chance to charge
      if (Math.random() < this.CHARGE_CHANCE)
      {
        console.log('[Orc1] Performing HEAVY CHARGE!');
        
        const direction = this.getDirectionToTarget();
        
        // Calculate velocity in units per second
        // Velocity = Distance / Time
        this.dashVelocityX = (direction.x * this.CHARGE_DISTANCE) / this.DASH_DURATION;
        this.dashVelocityY = (direction.y * this.CHARGE_DISTANCE) / this.DASH_DURATION;
        
        // Start dash
        this.isDashing = true;
        this.dashTimeRemaining = this.DASH_DURATION;
        
        // Increase animation speed during dash
        if (this.sprite && this.sprite.animationSpeed)
        {
          this.sprite.animationSpeed = 0.25; // Faster animation during dash
        }
        
        // Set cooldown
        this.chargeCooldown = this.CHARGE_COOLDOWN_MAX;
      }
    }
  }
  
  /**
   * Apply separation with reduced pushback
   */
  protected applySeparation(separationDistance = 50): void
  {
    if (!this.nearbyMonsters) return;

    let pushX = 0;
    let pushY = 0;

    for (const other of this.nearbyMonsters)
    {
        if (other === this) continue;

        const otherPos = other.getPosition();
        const dx = this.currentPosition.x - otherPos.x;
        const dy = this.currentPosition.y - otherPos.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist > 0 && dist < separationDistance)
        {
            pushX += dx / dist;
            pushY += dy / dist;
        }
    }

    if (pushX !== 0 || pushY !== 0)
    {
        this.currentPosition.x += pushX * 0.25;
        this.currentPosition.y += pushY * 0.25;
        this.position.set(this.currentPosition.x, this.currentPosition.y);
    }
  }
  
  /**
   * Orc1 AI decision logic
   */
  protected makeAIDecision(delta: number): void
  {
    // Update dash first (always runs, even during attack)
    this.updateDash(delta);
    
    // Reset animation speed when not dashing
    if (!this.isDashing && this.sprite && this.sprite.animationSpeed !== 0.2)
    {
      this.sprite.animationSpeed = 0.2; // Normal animation speed
    }
    
    // Can't make decisions while attacking or dashing
    if (this.currentState === EntityState.ATTACKING || this.isDashing)
    {
      return;
    }
    
    // Update charge cooldown
    this.updateChargeCooldown(delta);
    
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
      
      // Attempt charge when close
      this.performCharge();
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