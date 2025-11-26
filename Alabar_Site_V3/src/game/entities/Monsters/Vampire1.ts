/**
 * Vampire1.ts - Vampire monster implementation (Tier 1 - Fast Attacker)
 */

import { AssetManager } from '../../../managers/AssetManager';
import { MonsterBase, MonsterConfig, MonsterBehavior } from './MonsterBase';
import { EntityState } from '../BaseEntity';

export interface Vampire1Config
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

export class Vampire1 extends MonsterBase
{
  constructor(assetManager: AssetManager, config: Vampire1Config)
  {
    // Define Vampire1-specific stats
    const monsterConfig: MonsterConfig = {
      startX: config.startX,
      startY: config.startY,
      speed: 1.10, // Much faster than slimes!
      spritesheetKey: 'vampire1_spritesheet',
      animationPrefix: 'Vampire1',
      health: 20,
      damage: 5,
      attackRange: 40,
      detectionRange: 3500, // Slightly longer detection range
      bounds: config.bounds
    };
    
    super(assetManager, monsterConfig);
    
    // Shorter attack cooldown for vampires
    this.attackCooldownMax = 75; // 1.25 seconds
  }
  
  /**
   * Vampire1 AI decision logic
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
