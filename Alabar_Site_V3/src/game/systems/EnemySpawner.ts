/**
 * EnemySpawner.ts - Complete enemy spawning system
 * Handles wave-based spawning of all 12 monster types
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

export type MonsterType = 
  | 'Slime1' | 'Slime2' | 'Slime3'
  | 'Plant1' | 'Plant2' | 'Plant3'
  | 'Vampire1' | 'Vampire2' | 'Vampire3'
  | 'Orc1' | 'Orc2' | 'Orc3';

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
  spawnRadius: number; // How far from player to spawn
}

export class EnemySpawner
{
  private assetManager: AssetManager;
  private player: Player;
  private bounds: any;
  private spawnRadius: number;
  
  // Spawning state
  private spawnTimer: number = 0;
  private spawnInterval: number = 2; // Spawn every 2 seconds
  
  // Wave system
  private currentWave: number = 1;
  private waveTimer: number = 0;
  private readonly WAVE_DURATION: number = 90; // 30 seconds per wave
  
  // Monster pool per wave
  private readonly WAVE_MONSTERS: Record<number, MonsterType[]> = {
    1: ['Slime1'],
    2: ['Slime1', 'Slime2', 'Slime3', 'Plant1'],
    3: ['Slime2', 'Slime3', 'Plant1', 'Plant2'],
    4: ['Slime3', 'Plant1', 'Plant2', 'Plant3', 'Vampire1'],
    5: ['Plant2', 'Plant3', 'Vampire1', 'Vampire2'],
    6: ['Plant3', 'Vampire1', 'Vampire2', 'Vampire3', 'Orc1'],
    7: ['Vampire2', 'Vampire3', 'Orc1', 'Orc2'],
    8: ['Vampire3', 'Orc1', 'Orc2', 'Orc3']
  };
  
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
    
    // Update wave timer
    this.waveTimer += delta;
    if (this.waveTimer >= this.WAVE_DURATION)
    {
      this.advanceWave();
      this.waveTimer = 0;
    }
    
    // Update spawn timer
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval)
    {
      this.spawnTimer = 0;
      
      // Spawn 1-3 monsters
      const spawnCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < spawnCount; i++)
      {
        const monster = this.spawnRandomMonster();
        if (monster)
        {
          spawnedMonsters.push(monster);
        }
      }
    }
    
    return spawnedMonsters;
  }
  
  /**
   * Advance to next wave
   */
  private advanceWave(): void
  {
    this.currentWave = Math.min(this.currentWave + 1, 8);
    
    // Increase spawn rate
    this.spawnInterval = Math.max(0.5, 2 - (this.currentWave * 0.2));
    
    console.log(`[EnemySpawner] Wave ${this.currentWave} started! (Spawn interval: ${this.spawnInterval.toFixed(2)}s)`);
  }
  
  /**
   * Spawn random monster from current wave pool
   */
  private spawnRandomMonster(): MonsterBase | null
  {
    const monsterPool = this.WAVE_MONSTERS[this.currentWave] || this.WAVE_MONSTERS[8];
    const monsterType = monsterPool[Math.floor(Math.random() * monsterPool.length)];
    
    return this.spawnMonster(monsterType);
  }
  
  /**
   * Spawn specific monster type
   */
  private spawnMonster(monsterType: MonsterType): MonsterBase | null
  {
    const spawnPos = this.getRandomSpawnPosition();
    
    if (!spawnPos)
    {
      return null;
    }
    
    let monster: MonsterBase | null = null;
    
    switch (monsterType)
    {
      case 'Slime1':
        monster = new Slime1(this.assetManager, {
          startX: spawnPos.x,
          startY: spawnPos.y,
          bounds: this.bounds
        });
        break;
      
      case 'Slime2':
        monster = new Slime2(this.assetManager, {
          startX: spawnPos.x,
          startY: spawnPos.y,
          bounds: this.bounds
        });
        break;
      
      case 'Slime3':
        monster = new Slime3(this.assetManager, {
          startX: spawnPos.x,
          startY: spawnPos.y,
          bounds: this.bounds
        });
        break;
      
      case 'Plant1':
        monster = new Plant1(this.assetManager, {
          startX: spawnPos.x,
          startY: spawnPos.y,
          bounds: this.bounds
        });
        break;
      
      case 'Plant2':
        monster = new Plant2(this.assetManager, {
          startX: spawnPos.x,
          startY: spawnPos.y,
          bounds: this.bounds
        });
        break;
      
      case 'Plant3':
        monster = new Plant3(this.assetManager, {
          startX: spawnPos.x,
          startY: spawnPos.y,
          bounds: this.bounds
        });
        break;
      
      case 'Vampire1':
        monster = new Vampire1(this.assetManager, {
          startX: spawnPos.x,
          startY: spawnPos.y,
          bounds: this.bounds
        });
        break;
      
      case 'Vampire2':
        monster = new Vampire2(this.assetManager, {
          startX: spawnPos.x,
          startY: spawnPos.y,
          bounds: this.bounds
        });
        break;
      
      case 'Vampire3':
        monster = new Vampire3(this.assetManager, {
          startX: spawnPos.x,
          startY: spawnPos.y,
          bounds: this.bounds
        });
        break;
      
      case 'Orc1':
        monster = new Orc1(this.assetManager, {
          startX: spawnPos.x,
          startY: spawnPos.y,
          bounds: this.bounds
        });
        break;
      
      case 'Orc2':
        monster = new Orc2(this.assetManager, {
          startX: spawnPos.x,
          startY: spawnPos.y,
          bounds: this.bounds
        });
        break;
      
      case 'Orc3':
        monster = new Orc3(this.assetManager, {
          startX: spawnPos.x,
          startY: spawnPos.y,
          bounds: this.bounds
        });
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
    this.currentWave = Math.max(1, Math.min(8, waveNumber));
    this.waveTimer = 0;
    this.spawnInterval = Math.max(0.5, 2 - (this.currentWave * 0.2));
    
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
    
    console.log('[EnemySpawner] Reset to wave 1');
  }
}