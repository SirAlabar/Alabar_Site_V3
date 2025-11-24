/**
 * Slime1.ts - Slime monster implementation
 */

import { AssetManager } from '../../managers/AssetManager';
import { MonsterBase, MonsterConfig, MonsterBehavior } from './MonsterBase';
import { EntityState } from './BaseEntity';

export interface Slime1Config
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

export class Slime1 extends MonsterBase
{
  constructor(assetManager: AssetManager, config: Slime1Config)
  {
    // Define Slime-specific stats
    const monsterConfig: MonsterConfig = {
      startX: config.startX,
      startY: config.startY,
      speed: 1.0,
      spritesheetKey: 'slime1_spritesheet',
      animationPrefix: 'Slime1',
      health: 50,
      damage: 10,
      attackRange: 40,
      detectionRange: 300,
      bounds: config.bounds
    };
    
    super(assetManager, monsterConfig);
    
    // Set attack cooldown
    this.attackCooldownMax = 90; // 1.5 seconds
  }
  
  /**
   * Slime AI decision logic
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