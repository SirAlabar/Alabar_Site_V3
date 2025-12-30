/**
 * DropManager.ts - Drop system
 */

export type MonsterType = 
  | 'Slime1' | 'Slime2' | 'Slime3'
  | 'Plant1' | 'Plant2' | 'Plant3'
  | 'Vampire1' | 'Vampire2' | 'Vampire3'
  | 'Orc1' | 'Orc2' | 'Orc3'
  | 'Turkey' | 'Pig';

export type DropType = 'crystal' | 'food' | 'star' | 'skull' | 'none';

export type FoodTier = 'bacon' | 'ribs' | 'steak' | 'chiken_leg' | 'eggs' | 'worm';

export interface DropResult
{
  type: DropType;
  tier?: number;
  xpValue?: number;
  healPercent?: number;
  foodTier?: FoodTier;
}

interface DropEntry
{
  type: DropType;
  weight: number;
  tier?: number;
  xpValue?: number;
  healPercent?: number;
  foodTier?: FoodTier;
}

type DropTable = DropEntry[];

/**
 * Crystal XP values
 */
const CRYSTAL_XP_VALUES: Record<number, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 5,
  5: 7,
  6: 10,
  7: 15,
  8: 20,
  9: 25,
  10: 30
};

export class DropManager
{
  private dropTables: Record<MonsterType, DropTable>;
  
  constructor()
  {
    this.dropTables = this.initializeDropTables();
  }
  
  /**
   * Initialize all monster drop tables
   */
  private initializeDropTables(): Record<MonsterType, DropTable>
  {
    return {
      // TIER 1 - SLIMES
      'Slime1': [
        { type: 'crystal', weight: 70, tier: 1, xpValue: CRYSTAL_XP_VALUES[1] },
        { type: 'crystal', weight: 9, tier: 2, xpValue: CRYSTAL_XP_VALUES[2] },
        { type: 'crystal', weight: 1, tier: 3, xpValue: CRYSTAL_XP_VALUES[3] },
        { type: 'none', weight: 20 }
      ],
      
      'Slime2': [
        { type: 'crystal', weight: 55, tier: 1, xpValue: CRYSTAL_XP_VALUES[1] },
        { type: 'crystal', weight: 15, tier: 2, xpValue: CRYSTAL_XP_VALUES[2] },
        { type: 'crystal', weight: 10, tier: 3, xpValue: CRYSTAL_XP_VALUES[3] },
        { type: 'none', weight: 20 }
      ],
      
      'Slime3': [
        { type: 'crystal', weight: 40, tier: 1, xpValue: CRYSTAL_XP_VALUES[1] },
        { type: 'crystal', weight: 25, tier: 2, xpValue: CRYSTAL_XP_VALUES[2] },
        { type: 'crystal', weight: 15, tier: 3, xpValue: CRYSTAL_XP_VALUES[3] },
        { type: 'none', weight: 20 }
      ],
      
      // TIER 2 - PLANTS
      'Plant1': [
        { type: 'crystal', weight: 45, tier: 2, xpValue: CRYSTAL_XP_VALUES[2] },
        { type: 'crystal', weight: 20, tier: 3, xpValue: CRYSTAL_XP_VALUES[3] },
        { type: 'crystal', weight: 15, tier: 4, xpValue: CRYSTAL_XP_VALUES[4] },
        { type: 'none', weight: 20 }
      ],
      
      'Plant2': [
        { type: 'crystal', weight: 30, tier: 2, xpValue: CRYSTAL_XP_VALUES[2] },
        { type: 'crystal', weight: 30, tier: 3, xpValue: CRYSTAL_XP_VALUES[3] },
        { type: 'crystal', weight: 20, tier: 4, xpValue: CRYSTAL_XP_VALUES[4] },
        { type: 'none', weight: 20 }
      ],
      
      'Plant3': [
        { type: 'crystal', weight: 20, tier: 2, xpValue: CRYSTAL_XP_VALUES[2] },
        { type: 'crystal', weight: 30, tier: 3, xpValue: CRYSTAL_XP_VALUES[3] },
        { type: 'crystal', weight: 30, tier: 4, xpValue: CRYSTAL_XP_VALUES[4] },
        { type: 'none', weight: 20 }
      ],
      
      // TIER 3 - VAMPIRES
      'Vampire1': [
        { type: 'crystal', weight: 30, tier: 3, xpValue: CRYSTAL_XP_VALUES[3] },
        { type: 'crystal', weight: 20, tier: 4, xpValue: CRYSTAL_XP_VALUES[4] },
        { type: 'crystal', weight: 10, tier: 5, xpValue: CRYSTAL_XP_VALUES[5] },
        { type: 'crystal', weight: 20, tier: 2, xpValue: CRYSTAL_XP_VALUES[2] },
        { type: 'none', weight: 20 }
      ],
      
      'Vampire2': [
        { type: 'crystal', weight: 25, tier: 3, xpValue: CRYSTAL_XP_VALUES[3] },
        { type: 'crystal', weight: 25, tier: 4, xpValue: CRYSTAL_XP_VALUES[4] },
        { type: 'crystal', weight: 15, tier: 5, xpValue: CRYSTAL_XP_VALUES[5] },
        { type: 'crystal', weight: 10, tier: 6, xpValue: CRYSTAL_XP_VALUES[6] },
        { type: 'none', weight: 25 }
      ],
      
      'Vampire3': [
        { type: 'crystal', weight: 20, tier: 3, xpValue: CRYSTAL_XP_VALUES[3] },
        { type: 'crystal', weight: 25, tier: 4, xpValue: CRYSTAL_XP_VALUES[4] },
        { type: 'crystal', weight: 20, tier: 5, xpValue: CRYSTAL_XP_VALUES[5] },
        { type: 'crystal', weight: 15, tier: 6, xpValue: CRYSTAL_XP_VALUES[6] },
        { type: 'none', weight: 20 }
      ],
      
      // TIER 4 - ORCS
      'Orc1': [
        { type: 'crystal', weight: 25, tier: 4, xpValue: CRYSTAL_XP_VALUES[4] },
        { type: 'crystal', weight: 20, tier: 5, xpValue: CRYSTAL_XP_VALUES[5] },
        { type: 'crystal', weight: 15, tier: 6, xpValue: CRYSTAL_XP_VALUES[6] },
        { type: 'crystal', weight: 20, tier: 3, xpValue: CRYSTAL_XP_VALUES[3] },
        { type: 'none', weight: 20 }
      ],
      
      'Orc2': [
        { type: 'crystal', weight: 20, tier: 4, xpValue: CRYSTAL_XP_VALUES[4] },
        { type: 'crystal', weight: 20, tier: 5, xpValue: CRYSTAL_XP_VALUES[5] },
        { type: 'crystal', weight: 20, tier: 6, xpValue: CRYSTAL_XP_VALUES[6] },
        { type: 'crystal', weight: 20, tier: 7, xpValue: CRYSTAL_XP_VALUES[7] },
        { type: 'none', weight: 20 }
      ],
      
      'Orc3': [
        { type: 'crystal', weight: 15, tier: 4, xpValue: CRYSTAL_XP_VALUES[4] },
        { type: 'crystal', weight: 20, tier: 5, xpValue: CRYSTAL_XP_VALUES[5] },
        { type: 'crystal', weight: 20, tier: 6, xpValue: CRYSTAL_XP_VALUES[6] },
        { type: 'crystal', weight: 20, tier: 7, xpValue: CRYSTAL_XP_VALUES[7] },
        { type: 'crystal', weight: 5, tier: 8, xpValue: CRYSTAL_XP_VALUES[8] },
        { type: 'none', weight: 20 }
      ],
      
      // PASSIVE CREATURES - FOOD DROPPERS
      'Turkey': [
        // 80% food drops with weighted tiers
        { type: 'food', weight: 47, foodTier: 'eggs' },        // 47% - Tier 1 (10% heal)
        { type: 'food', weight: 8, foodTier: 'worm' },         // 8% - Tier 1 (5% damage - poison)
        { type: 'food', weight: 20, foodTier: 'chiken_leg' },  // 20% - Tier 2 (20% heal)
        { type: 'food', weight: 10, foodTier: 'steak' },       // 10% - Tier 3 (30% heal)
        { type: 'food', weight: 5, foodTier: 'ribs' },         // 5% - Tier 4 (40% heal)
        { type: 'food', weight: 3, foodTier: 'bacon' },        // 3% - Tier 5 (50% heal - best)
        { type: 'none', weight: 7 }                            // 7% - No drop
      ],
      
      'Pig': [
        // 80% food drops with weighted tiers (same as Turkey)
        { type: 'food', weight: 37, foodTier: 'eggs' },        // 37% - Tier 1 (10% heal)
        { type: 'food', weight: 8, foodTier: 'worm' },         // 8% - Tier 1 (5% damage - poison)
        { type: 'food', weight: 10, foodTier: 'chiken_leg' },  // 10% - Tier 2 (20% heal)
        { type: 'food', weight: 10, foodTier: 'steak' },       // 10% - Tier 3 (30% heal)
        { type: 'food', weight: 15, foodTier: 'ribs' },         // 15% - Tier 4 (40% heal)
        { type: 'food', weight: 13, foodTier: 'bacon' },        // 13% - Tier 5 (50% heal - best)
        { type: 'none', weight: 7 }                            // 7% - No drop
      ]
    };
  }
  
  /**
   * Roll for a drop from a specific monster
   */
  rollDrop(monsterType: MonsterType): DropResult
  {
    const table = this.dropTables[monsterType];
    
    if (!table)
    {
      console.error(`[DropManager] Unknown monster type: ${monsterType}`);
      return { type: 'none' };
    }
    
    // Calculate total weight
    const totalWeight = table.reduce((sum, entry) => sum + entry.weight, 0);
    
    // Roll random value
    let roll = Math.random() * totalWeight;
    
    // Find selected entry
    for (const entry of table)
    {
      roll -= entry.weight;
      
      if (roll <= 0)
      {
        return {
          type: entry.type,
          tier: entry.tier,
          xpValue: entry.xpValue,
          healPercent: entry.healPercent,
          foodTier: entry.foodTier
        };
      }
    }
    
    // Fallback
    return { type: 'none' };
  }
  
  /**
   * Roll for rare drops (Star/Skull) - works for ANY monster
   * Call this BEFORE rollDrop() - if it returns non-null, skip normal drops
   * 
   * - 0.5% chance for Star (invincibility)
   * - 0.5% chance for Skull (screen clear)
   * - Total: 1% rare drop chance
   */
  rollRareDrop(): DropResult | null
  {
    const roll = Math.random();
    
    // 0.5% chance for Star
    if (roll < 0.005)
    {
      return { type: 'star' };
    }
    
    // 0.5% chance for Skull (next 0.5% after Star)
    if (roll < 0.010)
    {
      return { type: 'skull' };
    }
    
    // No rare drop
    return null;
  }
  
  /**
   * Get crystal XP value by tier
   */
  getCrystalXPValue(tier: number): number
  {
    return CRYSTAL_XP_VALUES[tier] ?? 1;
  }
}