/**
 * EnemySpawner.ts - Complete enemy spawning system with wave progression
 * Handles wave-based spawning of all 12 monster types with special events
 */

import { AssetManager } from '../../managers/AssetManager';
import { Player } from '../entities/Player';
import { MonsterBase } from '../entities/monsters/MonsterBase';

// Import all monster classes
import { Slime1 } from '../entities/monsters/Slime1';
import { Slime2 } from '../entities/monsters/Slime2';
import { Slime3 } from '../entities/monsters/Slime3';
import { Plant1 } from '../entities/monsters/Plant1';
import { Plant2 } from '../entities/monsters/Plant2';
import { Plant3 } from '../entities/monsters/Plant3';
import { Vampire1 } from '../entities/monsters/Vampire1';
import { Vampire2 } from '../entities/monsters/Vampire2';
import { Vampire3 } from '../entities/monsters/Vampire3';
import { Orc1 } from '../entities/monsters/Orc1';
import { Orc2 } from '../entities/monsters/Orc2';
import { Orc3 } from '../entities/monsters/Orc3';
import { Turkey } from '../entities/monsters/Turkey';
import { Pig } from '../entities/monsters/Pig';

export type MonsterType = 
  | 'Slime1' | 'Slime2' | 'Slime3'
  | 'Plant1' | 'Plant2' | 'Plant3'
  | 'Vampire1' | 'Vampire2' | 'Vampire3'
  | 'Orc1' | 'Orc2' | 'Orc3'
  | 'Turkey' | 'Pig';

interface SpawnConfig
{
  assetManager: AssetManager;
  player: Player;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  spawnRadius: number;
}

interface WeightedMonster
{
  type: MonsterType;
  weight: number;
}

export class EnemySpawner
{
  private assetManager: AssetManager;
  private player: Player;
  private bounds: any;
  private spawnRadius: number;
  
  // Spawning state
  private spawnTimer: number = 0;
  private spawnInterval: number = 2;
  
  // Wave system
  private currentWave: number = 1;
  private waveTimer: number = 0;
  private readonly WAVE_DURATION: number = 60; // 60 seconds per wave
  
  // Monster progression order (index-based)
  private readonly MONSTER_PROGRESSION: MonsterType[] = [
    'Slime1',   // 0
    'Slime2',   // 1
    'Slime3',   // 2
    'Plant1',   // 3
    'Plant2',   // 4
    'Plant3',   // 5
    'Vampire1', // 6
    'Vampire2', // 7
    'Vampire3', // 8
    'Orc1',     // 9
    'Orc2',     // 10
    'Orc3'      // 11
  ];
  
  // Fixed probability tables for waves 1-5
  private readonly WAVE_PROBABILITIES: Record<number, Record<MonsterType, number>> = {
    1: {
      'Slime1': 0.95,
      'Slime2': 0.04,
      'Slime3': 0.01,
      'Plant1': 0, 'Plant2': 0, 'Plant3': 0,
      'Vampire1': 0, 'Vampire2': 0, 'Vampire3': 0,
      'Orc1': 0, 'Orc2': 0, 'Orc3': 0
    },
    2: {
      'Slime1': 0.80,
      'Slime2': 0.15,
      'Slime3': 0.05,
      'Plant1': 0, 'Plant2': 0, 'Plant3': 0,
      'Vampire1': 0, 'Vampire2': 0, 'Vampire3': 0,
      'Orc1': 0, 'Orc2': 0, 'Orc3': 0
    },
    3: {
      'Slime1': 0.60,
      'Slime2': 0.30,
      'Slime3': 0.10,
      'Plant1': 0, 'Plant2': 0, 'Plant3': 0,
      'Vampire1': 0, 'Vampire2': 0, 'Vampire3': 0,
      'Orc1': 0, 'Orc2': 0, 'Orc3': 0
    },
    4: {
      'Slime1': 0, 'Slime2': 0.55, 'Slime3': 0.30,
      'Plant1': 0.05,
      'Plant2': 0, 'Plant3': 0,
      'Vampire1': 0.05, 'Vampire2': 0, 'Vampire3': 0,
      'Orc1': 0.05, 'Orc2': 0, 'Orc3': 0
    },
    5: {
      'Slime1': 0, 'Slime2': 0.15, 'Slime3': 0.50,
      'Plant1': 0.10, 'Plant2': 0.05,
      'Plant3': 0,
      'Vampire1': 0.10, 'Vampire2': 0, 'Vampire3': 0,
      'Orc1': 0.10, 'Orc2': 0, 'Orc3': 0
    }
  };
  
  // Plant weight penalties
  private readonly PLANT_WEIGHT_MODIFIERS: Record<string, number> = {
    'Plant1': 0.12,
    'Plant2': 0.07,
    'Plant3': 0.05
  };
  
  // Special wave tracking
  private isPlantBarrageWave: boolean = false;
  private waveStarted: boolean = false;
  
  // Reference to projectile manager (for plants)
  public projectileManager: any = null;
  
  constructor(config: SpawnConfig)
  {
    this.assetManager = config.assetManager;
    this.player = config.player;
    this.bounds = config.bounds;
    this.spawnRadius = config.spawnRadius;
  }
  
  /**
   * Set projectile manager reference (for plant monsters)
   */
  setProjectileManager(projectileManager: any): void
  {
    this.projectileManager = projectileManager;
  }
  
  /**
   * Update spawner
   */
  update(delta: number): MonsterBase[]
  {
    const spawnedMonsters: MonsterBase[] = [];
    
    // Check if wave just started
    if (!this.waveStarted)
    {
      this.onWaveStart(spawnedMonsters);
      this.waveStarted = true;
    }
    
    // Update wave timer
    this.waveTimer += delta;
    if (this.waveTimer >= this.WAVE_DURATION)
    {
      this.advanceWave();
      this.waveTimer = 0;
      this.waveStarted = false;
    }
    
    // Update spawn timer
    this.spawnTimer += delta;
    
    // Calculate spawn interval based on wave and special conditions
    let currentInterval = this.spawnInterval;
    if (this.isPlantBarrageWave)
    {
      currentInterval *= 0.8; // Faster spawning for plant barrage
    }
    
    if (this.spawnTimer >= currentInterval)
    {
      this.spawnTimer = 0;
      
      // Calculate spawn count based on wave
      const spawnCount = this.calculateSpawnCount();
      
      for (let i = 0; i < spawnCount; i++)
      {
        // 15% chance for vampire pack after wave 8
        if (this.currentWave >= 8 && Math.random() < 0.15)
        {
          const vampirePack = this.spawnVampirePack();
          spawnedMonsters.push(...vampirePack);
        }
        else
        {
          const monster = this.spawnRandomMonster();
          if (monster)
          {
            spawnedMonsters.push(monster);
          }
        }
      }
    }
    
    return spawnedMonsters;
  }
  
  /**
   * Handle wave start events
   */
  private onWaveStart(spawnedMonsters: MonsterBase[]): void
  {
    console.log(`[EnemySpawner] Wave ${this.currentWave} started!`);
    
    // Check for boss wave (15, 20, 30, 35, 40...)
    if (this.currentWave >= 15 && (this.currentWave - 15) % 5 === 0)
    {
      const boss = this.spawnBoss();
      if (boss)
      {
        spawnedMonsters.push(boss);
        console.log(`[EnemySpawner] Boss spawned for wave ${this.currentWave}!`);
      }
    }
    
    // Check for plant pack wave (12, 18, 24, 30, 36...)
    if (this.currentWave >= 12 && (this.currentWave - 12) % 6 === 0)
    {
      const plantPack = this.spawnPlantPack();
      spawnedMonsters.push(...plantPack);
      console.log(`[EnemySpawner] Plant pack spawned for wave ${this.currentWave}!`);
    }
    
    // Check for wave 25 plant barrage
    this.isPlantBarrageWave = (this.currentWave === 25);
    if (this.isPlantBarrageWave)
    {
      console.log(`[EnemySpawner] PLANT BARRAGE WAVE!`);
    }
  }
  
  /**
   * Advance to next wave
   */
  private advanceWave(): void
  {
    this.currentWave++;
    
    // Update spawn interval: max(0.3, 2 - wave * 0.1)
    this.spawnInterval = Math.max(0.3, 2 - (this.currentWave * 0.1));
    
    console.log(`[EnemySpawner] Advancing to wave ${this.currentWave} (Spawn interval: ${this.spawnInterval.toFixed(2)}s)`);
  }
  
  /**
   * Calculate spawn count based on wave
   * Formula: base = 1 + floor(wave * 0.15), spawnCount = base + random(0-1)
   */
  private calculateSpawnCount(): number
  {
    const base = 1 + Math.floor(this.currentWave * 0.15);
    const random = Math.floor(Math.random() * 2); // 0 or 1
    
    // Plant barrage: 3-5 plants
    if (this.isPlantBarrageWave)
    {
      return 3 + Math.floor(Math.random() * 3); // 3, 4, or 5
    }
    
    return base + random;
  }
  
  /**
   * Spawn random monster from current wave pool
   */
  private spawnRandomMonster(): MonsterBase | null
  {
    // 1% chance to spawn passive creature (Turkey/Pig) from wave 1 onwards
    if (Math.random() < 0.01)
    {
      const passiveType: MonsterType = Math.random() < 0.5 ? 'Turkey' : 'Pig';
      return this.spawnMonster(passiveType);
    }
    
    let monsterType: MonsterType;
    
    // Waves 1-5: Use fixed probability tables
    if (this.currentWave <= 5)
    {
      monsterType = this.selectMonsterByProbability(this.currentWave);
    }
    // Wave 6+: Use automatic weighted system
    else
    {
      monsterType = this.selectMonsterByWeight();
    }
    
    return this.spawnMonster(monsterType);
  }
  
  /**
   * Select monster using fixed probability table (waves 1-5)
   */
  private selectMonsterByProbability(wave: number): MonsterType
  {
    const probabilities = this.WAVE_PROBABILITIES[wave];
    const rand = Math.random();
    
    let cumulative = 0;
    for (const [type, prob] of Object.entries(probabilities))
    {
      cumulative += prob;
      if (rand <= cumulative)
      {
        return type as MonsterType;
      }
    }
    
    // Fallback
    return 'Slime1';
  }
  
  /**
   * Select monster using weighted system (wave 6+)
   * Formula: unlockedCount = min(totalTypes, 3 + wave * 0.3)
   *          weight = max(1, (index + 1) * 0.8 + wave * 0.25)
   */
  private selectMonsterByWeight(): MonsterType
  {
    const totalTypes = this.MONSTER_PROGRESSION.length;
    const unlockedCount = Math.floor(Math.min(totalTypes, 3 + this.currentWave * 0.3));
    
    const weightedMonsters: WeightedMonster[] = [];
    
    for (let i = 0; i < unlockedCount; i++)
    {
      const monsterType = this.MONSTER_PROGRESSION[i];
      let weight = Math.max(1, (i + 1) * 0.8 + this.currentWave * 0.25);
      
      // Apply plant weight penalties
      if (this.PLANT_WEIGHT_MODIFIERS[monsterType])
      {
        weight *= this.PLANT_WEIGHT_MODIFIERS[monsterType];
      }
      
      // Block plants during plant barrage (force only plants)
      if (this.isPlantBarrageWave)
      {
        if (!monsterType.includes('Plant'))
        {
          continue; // Skip non-plants
        }
        weight *= 2; // Boost plant weights
      }
      
      weightedMonsters.push({ type: monsterType, weight });
    }
    
    // Calculate total weight
    const totalWeight = weightedMonsters.reduce((sum, m) => sum + m.weight, 0);
    
    // Select random monster based on weights
    let rand = Math.random() * totalWeight;
    
    for (const monster of weightedMonsters)
    {
      rand -= monster.weight;
      if (rand <= 0)
      {
        return monster.type;
      }
    }
    
    // Fallback
    return weightedMonsters[weightedMonsters.length - 1].type;
  }
  
  /**
   * Spawn boss monster
   * Boss multipliers: HP x4, Damage x2, Speed x1.2, Size x1.5
   */
  private spawnBoss(): MonsterBase | null
  {
    // Select random monster type from current wave pool
    let bossType: MonsterType;
    
    if (this.currentWave <= 5)
    {
      bossType = this.selectMonsterByProbability(this.currentWave);
    }
    else
    {
      bossType = this.selectMonsterByWeight();
    }
    
    const boss = this.spawnMonster(bossType);
    
    if (boss)
    {
      // Mark as boss
      boss.setAsBoss();
      
      // HP x4
      const currentHealth = boss.getHealth();
      const maxHealth = boss.getMaxHealth();
      (boss as any).health = currentHealth * 4;
      (boss as any).maxHealth = maxHealth * 4;
      
      // Damage x2
      (boss as any).damage = (boss as any).damage * 2;
      
      // Speed x1.2
      (boss as any).movementSystem.speed *= 1.2;
      
      // Size x1.5
      boss.scale.set(1.5, 1.5);
      
      console.log(`[EnemySpawner] Boss created: ${bossType} (HP: ${boss.getMaxHealth()}, Damage: ${(boss as any).damage})`);
    }
    
    return boss;
  }
  
  /**
   * Spawn plant pack (5 plants in tight cluster)
   */
  private spawnPlantPack(): MonsterBase[]
  {
    const pack: MonsterBase[] = [];
    
    // Get center position around player
    const playerPos = this.player.getPosition();
    const angle = Math.random() * Math.PI * 2;
    const distance = this.spawnRadius + 100;
    
    const centerX = playerPos.x + Math.cos(angle) * distance;
    const centerY = playerPos.y + Math.sin(angle) * distance;
    
    // Spawn 5 plants in cluster
    for (let i = 0; i < 5; i++)
    {
      const clusterAngle = (Math.PI * 2 * i) / 5;
      const clusterRadius = 150;
      
      const x = centerX + Math.cos(clusterAngle) * clusterRadius;
      const y = centerY + Math.sin(clusterAngle) * clusterRadius;
      
      // Select plant type based on current wave
      let plantType: MonsterType = 'Plant1';
      if (this.currentWave >= 10)
      {
        plantType = 'Plant3';
      }
      else if (this.currentWave >= 7)
      {
        plantType = 'Plant2';
      }
      
      const plant = this.spawnMonsterAt(plantType, x, y);
      if (plant)
      {
        pack.push(plant);
      }
    }
    
    return pack;
  }
  
  /**
   * Spawn vampire pack (3-4 vampires charging from map edge)
   */
  private spawnVampirePack(): MonsterBase[]
  {
    const pack: MonsterBase[] = [];
    const packSize = 3 + Math.floor(Math.random() * 2); // 3 or 4
    
    const playerPos = this.player.getPosition();
    
    // Random edge: 0=top, 1=right, 2=bottom, 3=left
    const edge = Math.floor(Math.random() * 4);
    
    for (let i = 0; i < packSize; i++)
    {
      let spawnX: number;
      let spawnY: number;
      
      // Spawn at map edge
      switch (edge)
      {
        case 0: // Top
          spawnX = this.bounds.minX + Math.random() * (this.bounds.maxX - this.bounds.minX);
          spawnY = this.bounds.minY;
          break;
        case 1: // Right
          spawnX = this.bounds.maxX;
          spawnY = this.bounds.minY + Math.random() * (this.bounds.maxY - this.bounds.minY);
          break;
        case 2: // Bottom
          spawnX = this.bounds.minX + Math.random() * (this.bounds.maxX - this.bounds.minX);
          spawnY = this.bounds.maxY;
          break;
        case 3: // Left
          spawnX = this.bounds.minX;
          spawnY = this.bounds.minY + Math.random() * (this.bounds.maxY - this.bounds.minY);
          break;
        default:
          spawnX = playerPos.x;
          spawnY = playerPos.y;
      }
      
      // Select vampire type based on wave
      let vampireType: MonsterType = 'Vampire1';
      if (this.currentWave >= 8)
      {
        const rand = Math.random();
        if (rand < 0.33) vampireType = 'Vampire1';
        else if (rand < 0.66) vampireType = 'Vampire2';
        else vampireType = 'Vampire3';
      }
      
      const vampire = this.spawnMonsterAt(vampireType, spawnX, spawnY);
      if (vampire)
      {
        // Mark as pack member (ignore separation)
        (vampire as any).isPackMember = true;
        
        // Calculate trajectory toward player (fixed vector)
        const dx = playerPos.x - spawnX;
        const dy = playerPos.y - spawnY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0)
        {
          (vampire as any).packVelocity = {
            x: dx / distance,
            y: dy / distance
          };
        }
        
        pack.push(vampire);
      }
    }
    
    console.log(`[EnemySpawner] Vampire pack spawned (${packSize} vampires from edge ${edge})`);
    return pack;
  }
  
  /**
   * Spawn specific monster type at random position
   */
  private spawnMonster(monsterType: MonsterType): MonsterBase | null
  {
    const spawnPos = this.getRandomSpawnPosition();
    
    if (!spawnPos)
    {
      return null;
    }
    
    return this.spawnMonsterAt(monsterType, spawnPos.x, spawnPos.y);
  }
  
  /**
   * Spawn specific monster type at specific position
   */
  private spawnMonsterAt(monsterType: MonsterType, x: number, y: number): MonsterBase | null
  {
    let monster: MonsterBase | null = null;
    
    switch (monsterType)
    {
      case 'Slime1':
        monster = new Slime1(this.assetManager, {
          startX: x,
          startY: y,
          bounds: this.bounds
        });
        break;
      
      case 'Slime2':
        monster = new Slime2(this.assetManager, {
          startX: x,
          startY: y,
          bounds: this.bounds
        });
        break;
      
      case 'Slime3':
        monster = new Slime3(this.assetManager, {
          startX: x,
          startY: y,
          bounds: this.bounds
        });
        break;
      
      case 'Plant1':
        monster = new Plant1(this.assetManager, {
          startX: x,
          startY: y,
          bounds: this.bounds
        });
        break;
      
      case 'Plant2':
        monster = new Plant2(this.assetManager, {
          startX: x,
          startY: y,
          bounds: this.bounds
        });
        break;
      
      case 'Plant3':
        monster = new Plant3(this.assetManager, {
          startX: x,
          startY: y,
          bounds: this.bounds
        });
        break;
      
      case 'Vampire1':
        monster = new Vampire1(this.assetManager, {
          startX: x,
          startY: y,
          bounds: this.bounds
        });
        break;
      
      case 'Vampire2':
        monster = new Vampire2(this.assetManager, {
          startX: x,
          startY: y,
          bounds: this.bounds
        });
        break;
      
      case 'Vampire3':
        monster = new Vampire3(this.assetManager, {
          startX: x,
          startY: y,
          bounds: this.bounds
        });
        break;
      
      case 'Orc1':
        monster = new Orc1(this.assetManager, {
          startX: x,
          startY: y,
          bounds: this.bounds
        });
        break;
      
      case 'Orc2':
        monster = new Orc2(this.assetManager, {
          startX: x,
          startY: y,
          bounds: this.bounds
        });
        break;
      
      case 'Orc3':
        monster = new Orc3(this.assetManager, {
          startX: x,
          startY: y,
          bounds: this.bounds
        });
        break;
      
      case 'Turkey':
        monster = new Turkey(this.assetManager, x, y);
        break;
      
      case 'Pig':
        monster = new Pig(this.assetManager, x, y);
        break;
    }
    
    if (monster)
    {
      // Set target
      monster.setTarget(this.player);
      
      // Set projectile manager for plants
      if (monsterType.includes('Plant') && this.projectileManager)
      {
        (monster as any).projectileManager = this.projectileManager;
        
        // Apply plant barrage modifiers
        if (this.isPlantBarrageWave)
        {
          // Projectile speed x1.3 (applied in plant class)
          (monster as any).projectileSpeedMultiplier = 1.3;
          
          // Attack cooldown x0.7
          (monster as any).attackCooldownMax *= 0.7;
        }
      }
    }
    
    return monster;
  }
  
  /**
   * Get random spawn position around player
   */
  private getRandomSpawnPosition(): { x: number; y: number } | null
  {
    const playerPos = this.player.getPosition();
    
    // Random angle
    const angle = Math.random() * Math.PI * 2;
    
    // Random distance (spawn radius ± 100)
    const distance = this.spawnRadius + (Math.random() * 200 - 100);
    
    // Calculate position
    const x = playerPos.x + Math.cos(angle) * distance;
    const y = playerPos.y + Math.sin(angle) * distance;
    
    // Clamp to bounds
    const clampedX = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, x));
    const clampedY = Math.max(this.bounds.minY, Math.min(this.bounds.maxY, y));
    
    return { x: clampedX, y: clampedY };
  }
  
  /**
   * Get current wave number
   */
  getCurrentWave(): number
  {
    return this.currentWave;
  }
  
  /**
   * Get wave progress (0-1)
   */
  getWaveProgress(): number
  {
    return this.waveTimer / this.WAVE_DURATION;
  }
  
  /**
   * Force advance to specific wave
   */
  setWave(waveNumber: number): void
  {
    this.currentWave = Math.max(1, waveNumber);
    this.waveTimer = 0;
    this.waveStarted = false;
    this.spawnInterval = Math.max(0.3, 2 - (this.currentWave * 0.1));
    
    console.log(`[EnemySpawner] Forced to wave ${this.currentWave}`);
  }
  
  /**
   * Reset spawner
   */
  reset(): void
  {
    this.currentWave = 1;
    this.waveTimer = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 2;
    this.waveStarted = false;
    this.isPlantBarrageWave = false;
    
    console.log('[EnemySpawner] Reset to wave 1');
  }
}