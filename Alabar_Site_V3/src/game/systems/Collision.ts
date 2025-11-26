/**
 * Collision.ts - Collision detection and damage system
 * Handles circle-based collisions for entities
 */

import { MonsterBase } from '../entities/Monsters/MonsterBase';
import { Player } from '../entities/Player';

export interface CollisionConfig
{
  playerRadius?: number;
  monsterRadius?: number;
  projectileRadius?: number;
  xpRadius?: number;
}

export class CollisionSystem
{
  // Collision radii
  private playerRadius: number;
  private monsterRadius: number;
  private projectileRadius: number;
  private xpRadius: number;
  
  constructor(config: CollisionConfig = {})
  {
    this.playerRadius = config.playerRadius ?? 20;
    this.monsterRadius = config.monsterRadius ?? 25;
    this.projectileRadius = config.projectileRadius ?? 8;
    this.xpRadius = config.xpRadius ?? 30;
  }
  
  /**
   * Check circle collision between two entities
   */
  private checkCircleCollision(
    x1: number,
    y1: number,
    r1: number,
    x2: number,
    y2: number,
    r2: number
  ): boolean
  {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distanceSquared = dx * dx + dy * dy;
    const radiusSum = r1 + r2;
    
    return distanceSquared < radiusSum * radiusSum;
  }
  
  /**
   * Check collision between player and monster
   */
  checkPlayerMonsterCollision(player: Player, monster: MonsterBase): boolean
  {
    const playerPos = player.getPosition();
    const monsterPos = monster.getPosition();
    
    return this.checkCircleCollision(
      playerPos.x,
      playerPos.y,
      this.playerRadius,
      monsterPos.x,
      monsterPos.y,
      this.monsterRadius
    );
  }
  
  /**
   * Apply touch damage from monsters to player (Vampire Survivors DPS model)
   * Each monster deals individual DPS while touching
   */
  applyTouchDamage(player: Player, monsters: MonsterBase[], delta: number): void
  {
    if (player.isDead())
    {
      return;
    }
    
    // Check each monster for collision
    for (const monster of monsters)
    {
      if (monster.isDead())
      {
        continue;
      }
      
      // Check if monster is touching player
      if (this.checkPlayerMonsterCollision(player, monster))
      {
        // Apply DPS damage: damage per second * deltaTime
        // deltaTime is normalized (1.0 = 1 frame at 60fps)
        const damageThisFrame = monster.getStats().damage * delta;
        player.takeDamage(damageThisFrame);
      }
    }
  }
  
  /**
   * Check if player attack hits any monsters
   * Returns array of monsters within attack range while player is attacking
   */
  checkPlayerAttackHits(player: Player, monsters: MonsterBase[]): MonsterBase[]
  {
    if (!player.isPlayerAttacking())
    {
      return [];
    }
    
    const hitMonsters: MonsterBase[] = [];
    const playerPos = player.getPosition();
    const attackRange = player.getAttackRange();
    
    for (const monster of monsters)
    {
      if (monster.isDead())
      {
        continue;
      }
      
      const monsterPos = monster.getPosition();
      
      // Check if monster is within attack range (circle collision)
      if (this.checkCircleCollision(
        playerPos.x,
        playerPos.y,
        attackRange,
        monsterPos.x,
        monsterPos.y,
        this.monsterRadius
      ))
      {
        hitMonsters.push(monster);
      }
    }
    
    return hitMonsters;
  }
  
  /**
   * Apply player attack damage during impact frames
   * Respects hit list - each monster can only be hit once per attack
   * Should be called every frame during attack animation
   */
  applyAttackDamageOnImpactFrames(player: Player, monsters: MonsterBase[]): MonsterBase[]
  {
    // Only deal damage during impact frames
    if (!player.isAtAttackImpactFrame())
    {
      return [];
    }
    
    const newlyHitMonsters: MonsterBase[] = [];
    const playerPos = player.getPosition();
    const attackRange = player.getAttackRange();
    const playerDamage = player.getDamage();
    
    for (const monster of monsters)
    {
      if (monster.isDead())
      {
        continue;
      }
      
      // Skip if already hit during this attack
      if (player.hasHitMonster(monster))
      {
        continue;
      }
      
      const monsterPos = monster.getPosition();
      
      // Check if monster is within attack range
      if (this.checkCircleCollision(
        playerPos.x,
        playerPos.y,
        attackRange,
        monsterPos.x,
        monsterPos.y,
        this.monsterRadius
      ))
      {
        // Deal damage
        monster.takeDamage(playerDamage);
        
        // Mark as hit
        player.markMonsterAsHit(monster);
        
        // Track newly hit monsters for feedback
        newlyHitMonsters.push(monster);
      }
    }
    
    return newlyHitMonsters; // Return newly hit monsters for effects/sounds
  }
  
  /**
   * Check collision between player and all monsters
   * Returns array of colliding monsters
   */
  getCollidingMonsters(player: Player, monsters: MonsterBase[]): MonsterBase[]
  {
    const colliding: MonsterBase[] = [];
    
    for (const monster of monsters)
    {
      if (monster.isDead())
      {
        continue;
      }
      
      if (this.checkPlayerMonsterCollision(player, monster))
      {
        colliding.push(monster);
      }
    }
    
    return colliding;
  }
  
  /**
   * Update collision radii
   */
  setPlayerRadius(radius: number): void
  {
    this.playerRadius = radius;
  }
  
  setMonsterRadius(radius: number): void
  {
    this.monsterRadius = radius;
  }
  
  setProjectileRadius(radius: number): void
  {
    this.projectileRadius = radius;
  }
  
  setXPRadius(radius: number): void
  {
    this.xpRadius = radius;
  }
  
  /**
   * Get current collision radii
   */
  getRadii(): CollisionConfig
  {
    return {
      playerRadius: this.playerRadius,
      monsterRadius: this.monsterRadius,
      projectileRadius: this.projectileRadius,
      xpRadius: this.xpRadius
    };
  }
}