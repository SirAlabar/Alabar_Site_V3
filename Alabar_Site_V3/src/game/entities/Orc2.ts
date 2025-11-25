/**
 * Orc2.ts - Orc monster implementation
 */

import { AssetManager } from '../../managers/AssetManager';
import { MonsterBase, MonsterConfig, MonsterBehavior } from './MonsterBase';
import { EntityState } from './BaseEntity';

export interface Orc2Config
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

export class Orc2 extends MonsterBase
{
  // Heavy behavior properties
  private chargeCooldown: number = 0;
  private readonly CHARGE_COOLDOWN_MAX: number = 210; // 3.5 seconds
  private readonly CHARGE_RANGE: number = 180; // Longer charge range
  private readonly CHARGE_DISTANCE: number = 90;
  private readonly CHARGE_CHANCE: number = 0.5; // 50% chance 
  
  // Dash system
  private isDashing: boolean = false;
  private dashVelocityX: number = 0;
  private dashVelocityY: number = 0;
  private dashFramesRemaining: number = 0;
  private readonly DASH_DURATION_FRAMES: number = 13; // Medium speed dash (0.22 seconds at 60fps)
  
  // Enrage mechanic
  private isEnraged: boolean = false;
  private readonly ENRAGE_THRESHOLD: number = 0.40; // Enrage at 40% HP
  private readonly ENRAGE_SPEED_MULTIPLIER: number = 1.5;
  private readonly ENRAGE_DAMAGE_MULTIPLIER: number = 1.3;
  private baseSpeed: number;
  private baseDamage: number;
  
  constructor(assetManager: AssetManager, config: Orc2Config)
  {
    // Define Orc2-specific stats
    const monsterConfig: MonsterConfig = {
      startX: config.startX,
      startY: config.startY,
      speed: 0.60,
      spritesheetKey: 'orc2_spritesheet',
      animationPrefix: 'Orc2',
      health: 70,
      damage: 10,
      attackRange: 40,
      detectionRange: 3200,
      bounds: config.bounds
    };
    
    super(assetManager, monsterConfig);
    
    // Store base stats for enrage
    this.baseSpeed = 0.60;
    this.baseDamage = 10;
    
    // Attack cooldown
    this.attackCooldownMax = 110; // 1.83 seconds
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
      console.log('[Orc2] ENRAGED! Speed and damage increased!');
      
      // Apply enrage multipliers
      const newSpeed = this.baseSpeed * this.ENRAGE_SPEED_MULTIPLIER;
      this.movementSystem.setSpeed(newSpeed);
      this.damage = this.baseDamage * this.ENRAGE_DAMAGE_MULTIPLIER;
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
      console.log('[Orc2] Dash complete!');
    }
  }
  
  /**
   * Perform short charge towards player (more aggressive when enraged)
   */
  private performCharge(): void
  {
    if (!this.target || !this.canCharge())
    {
      return;
    }
    
    const distance = this.getDistanceToTarget();
    
    // Charge range increases when enraged
    const effectiveChargeRange = this.isEnraged ? this.CHARGE_RANGE * 1.3 : this.CHARGE_RANGE;
    
    // Only charge when player is close
    if (distance <= effectiveChargeRange && distance > 50)
    {
      // Higher chance when enraged
      const effectiveChance = this.isEnraged ? this.CHARGE_CHANCE * 1.5 : this.CHARGE_CHANCE;
      
      if (Math.random() < effectiveChance)
      {
        const enrageText = this.isEnraged ? 'ENRAGED ' : '';
        console.log(`[Orc2] Performing ${enrageText}HEAVY CHARGE!`);
        
        const direction = this.getDirectionToTarget();
        
        // Calculate total charge distance (longer when enraged)
        const chargeDistance = this.isEnraged ? this.CHARGE_DISTANCE * 1.2 : this.CHARGE_DISTANCE;
        
        // Calculate velocity per frame (distance / duration)
        const dashFrames = this.isEnraged ? this.DASH_DURATION_FRAMES * 0.8 : this.DASH_DURATION_FRAMES;
        this.dashVelocityX = (direction.x * chargeDistance) / dashFrames;
        this.dashVelocityY = (direction.y * chargeDistance) / dashFrames;
        
        // Start dash
        this.isDashing = true;
        this.dashFramesRemaining = dashFrames;
        
        // Increase animation speed during dash (more when enraged)
        if (this.sprite && this.sprite.animationSpeed)
        {
          this.sprite.animationSpeed = this.isEnraged ? 0.35 : 0.28;
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
   * Orc2 AI decision logic
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