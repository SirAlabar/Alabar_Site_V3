/**
 * Orc3.ts - Orc monster implementation
 */

import { AssetManager } from '../../../managers/AssetManager';
import { MonsterBase, MonsterConfig, MonsterBehavior } from './MonsterBase';
import { EntityState } from '../BaseEntity';

export interface Orc3Config
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

export class Orc3 extends MonsterBase
{
  // Heavy behavior properties
  private chargeCooldown: number = 0;
  private readonly CHARGE_COOLDOWN_MAX: number = 180; // 3 seconds
  private readonly CHARGE_RANGE: number = 200; // Longest charge range
  private readonly CHARGE_DISTANCE: number = 100; // Longest charge distance
  private readonly CHARGE_CHANCE: number = 0.6; // 60% chance
  
  // Dash system
  private isDashing: boolean = false;
  private dashVelocityX: number = 0;
  private dashVelocityY: number = 0;
  private dashFramesRemaining: number = 0;
  private readonly DASH_DURATION_FRAMES: number = 12; // Dash over 12 frames (0.2 seconds at 60fps)
  
  // Enrage mechanic
  private isEnraged: boolean = false;
  private readonly ENRAGE_THRESHOLD: number = 0.40; // Enrage at 40% HP
  private readonly ENRAGE_SPEED_MULTIPLIER: number = 1.5;
  private readonly ENRAGE_DAMAGE_MULTIPLIER: number = 1.3;
  private baseSpeed: number;
  private baseDamage: number;
  
  constructor(assetManager: AssetManager, config: Orc3Config)
  {
    // Define Orc3-specific stats
    const monsterConfig: MonsterConfig = {
      startX: config.startX,
      startY: config.startY,
      speed: 0.65, // Fastest orc
      spritesheetKey: 'orc3_spritesheet',
      animationPrefix: 'Orc3',
      health: 110,
      damage: 14,
      attackRange: 40,
      detectionRange: 3500,
      bounds: config.bounds
    };
    
    super(assetManager, monsterConfig);
    
    // Store base stats for enrage
    this.baseSpeed = 0.65;
    this.baseDamage = 14;
    
    // Fast attack cooldown for such a strong enemy
    this.attackCooldownMax = 100; // 1.67 seconds
  }
  
  /**
   * Check and apply enrage mechanic
   */
  private checkEnrage(): void
  {
    const healthPercentage = this.getHealthPercentage();
    
    // Trigger enrage when HP drops below threshold
    if (!this.isEnraged && healthPercentage <= this.ENRAGE_THRESHOLD)
    {
      this.isEnraged = true;
      console.warn('[Orc3] ⚠️ ENRAGED! EXTREMELY DANGEROUS! Speed and damage increased!');
      
      // Apply enrage multipliers
      const newSpeed = this.baseSpeed * this.ENRAGE_SPEED_MULTIPLIER;
      this.movementSystem.setSpeed(newSpeed);
      this.damage = this.baseDamage * this.ENRAGE_DAMAGE_MULTIPLIER;
      
      // Reduce charge cooldown when enraged
      if (this.chargeCooldown > 60)
      {
        this.chargeCooldown = 60; // Reset to 1 second if longer
      }
    }
  }
  
  /**
   * Update charge cooldown
   */
  private updateChargeCooldown(): void
  {
    if (this.chargeCooldown > 0)
    {
      this.chargeCooldown--;
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
  private updateDash(): void
  {
    if (!this.isDashing)
    {
      return;
    }
    
    // Apply dash velocity
    const newX = this.currentPosition.x + this.dashVelocityX;
    const newY = this.currentPosition.y + this.dashVelocityY;
    
    // Apply bounds
    const bounds = this.movementSystem.getBounds();
    const boundedX = bounds ? Math.max(bounds.minX, Math.min(bounds.maxX, newX)) : newX;
    const boundedY = bounds ? Math.max(bounds.minY, Math.min(bounds.maxY, newY)) : newY;
    
    this.setPosition(boundedX, boundedY);
    
    // Decrease remaining frames
    this.dashFramesRemaining--;
    
    // Check if dash is complete
    if (this.dashFramesRemaining <= 0)
    {
      this.isDashing = false;
      this.dashVelocityX = 0;
      this.dashVelocityY = 0;
      console.log('[Orc3] Dash complete!');
    }
  }
  
  /**
   * Perform devastating charge towards player
   */
  private performCharge(): void
  {
    if (!this.target || !this.canCharge())
    {
      return;
    }
    
    const distance = this.getDistanceToTarget();
    
    // Charge range dramatically increases when enraged
    const effectiveChargeRange = this.isEnraged ? this.CHARGE_RANGE * 1.5 : this.CHARGE_RANGE;
    
    // Only charge when player is in range
    if (distance <= effectiveChargeRange && distance > 50)
    {
      // Very high chance when enraged
      const effectiveChance = this.isEnraged ? Math.min(this.CHARGE_CHANCE * 1.8, 0.95) : this.CHARGE_CHANCE;
      
      if (Math.random() < effectiveChance)
      {
        const enrageText = this.isEnraged ? '⚠️ ENRAGED ' : '';
        console.log(`[Orc3] ${enrageText}DEVASTATING CHARGE!`);
        
        const direction = this.getDirectionToTarget();
        
        // Calculate total charge distance
        const chargeDistance = this.isEnraged ? this.CHARGE_DISTANCE * 1.4 : this.CHARGE_DISTANCE;
        
        // Calculate velocity per frame (distance / duration)
        const dashFrames = this.isEnraged ? this.DASH_DURATION_FRAMES * 0.7 : this.DASH_DURATION_FRAMES;
        this.dashVelocityX = (direction.x * chargeDistance) / dashFrames;
        this.dashVelocityY = (direction.y * chargeDistance) / dashFrames;
        
        // Start dash
        this.isDashing = true;
        this.dashFramesRemaining = dashFrames;
        
        // Increase animation speed during dash
        if (this.sprite && this.sprite.animationSpeed)
        {
          this.sprite.animationSpeed = 0.3; // Faster animation during dash
        }
        
        // Set cooldown
        this.chargeCooldown = this.isEnraged ? this.CHARGE_COOLDOWN_MAX * 0.7 : this.CHARGE_COOLDOWN_MAX;
      }
    }
  }
  
  /**
   * Apply separation with minimal pushback
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
        this.currentPosition.x += pushX * 0.15;
        this.currentPosition.y += pushY * 0.15;
        this.position.set(this.currentPosition.x, this.currentPosition.y);
    }
  }
  
  /**
   * Orc3 AI decision logic
   */
  protected makeAIDecision(): void
  {
    // Update dash first (always runs, even during attack)
    this.updateDash();
    
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
    
    // Check enrage status
    this.checkEnrage();
    
    // Update charge cooldown
    this.updateChargeCooldown();
    
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
      // Chase the target relentlessly
      if (this.behavior !== MonsterBehavior.CHASING)
      {
        this.transitionToChasing();
      }
      
      // Frequently attempt charge
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