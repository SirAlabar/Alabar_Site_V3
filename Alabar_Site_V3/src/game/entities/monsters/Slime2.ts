/**
 * Slime2.ts - Slime monster implementation (Tier 2)
 */

import { AssetManager } from '../../../managers/AssetManager';
import { MonsterBase, MonsterConfig, MonsterBehavior } from './MonsterBase';
import { EntityState } from '../BaseEntity';

export interface Slime2Config
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

export class Slime2 extends MonsterBase
{
  constructor(assetManager: AssetManager, config: Slime2Config)
  {
    // Define Slime2-specific stats
    const monsterConfig: MonsterConfig = {
      startX: config.startX,
      startY: config.startY,
      speed: 0.70,
      spritesheetKey: 'slime2_spritesheet',
      animationPrefix: 'Slime2',
      health: 12,
      damage: 2,
      attackRange: 40,
      detectionRange: 3000,
      bounds: config.bounds
    };
    
    super(assetManager, monsterConfig);
    
    // Set attack cooldown
    this.attackCooldownMax = 1.5; // 1.5 seconds
  }
  
  /**
   * Slime2 AI decision logic
   */
  protected makeAIDecision(): void
  {
    // Can't make decisions while attacking
    if (this.currentState === EntityState.ATTACKING)
    {
      return;
    }
    
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