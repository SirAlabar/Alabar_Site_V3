export interface WeaponStats {
    id: string;
    name: string;
    baseDamage: number;
    cooldown: number;
    projectileSpeed: number;
    area: number;
    duration: number;
}

export class Weapon {
    stats: WeaponStats;
    level: number;

    constructor(stats: WeaponStats) {
        this.stats = stats;
        this.level = 1;
    }

    levelUp() {
        this.level++;
        this.stats.baseDamage *= 1.15;
        this.stats.area *= 1.10;
        this.stats.cooldown *= 0.95;
    }
}

export const BasicSword: WeaponStats = {
    id: "sword",
    name: "Sword",
    baseDamage: 20,
    cooldown: 1.5,
    projectileSpeed: 0,
    area: 1,
    duration: 0.2,
};

export const FireWand: WeaponStats = {
    id: "fire_wand",
    name: "Fire Wand",
    baseDamage: 35,
    cooldown: 2.2,
    projectileSpeed: 6,
    area: 1,
    duration: 0,
};

export const MagicWand: WeaponStats = {
    id: "magic_wand",
    name: "Magic Wand",
    baseDamage: 15,
    cooldown: 1.0,
    projectileSpeed: 8,
    area: 1,
    duration: 0,
};

export const Dagger: WeaponStats = {
    id: "dagger",
    name: "Dagger",
    baseDamage: 12,
    cooldown: 0.45,
    projectileSpeed: 0,
    area: 0.8,
    duration: 0.15,
};

export const BattleAxe: WeaponStats = {
    id: "battle_axe",
    name: "Battle Axe",
    baseDamage: 45,
    cooldown: 2.8,
    projectileSpeed: 0,
    area: 1.5,
    duration: 0.35,
};

export const OrbitingShuriken: WeaponStats = {
    id: "orbiting_shuriken",
    name: "Orbiting Shuriken",
    baseDamage: 10,
    cooldown: 0.10,
    projectileSpeed: 0,
    area: 1.2,
    duration: 999, // always spinning
};

export const Fireball: WeaponStats = {
    id: "fireball",
    name: "Fireball",
    baseDamage: 28,
    cooldown: 1.8,
    projectileSpeed: 7,
    area: 1.1,
    duration: 0,
};

export const IceShard: WeaponStats = {
    id: "ice_shard",
    name: "Ice Shard",
    baseDamage: 40,
    cooldown: 2.2,
    projectileSpeed: 5,
    area: 1.0,
    duration: 0,
};

export const Boomerang: WeaponStats = {
    id: "boomerang",
    name: "Boomerang",
    baseDamage: 22,
    cooldown: 1.6,
    projectileSpeed: 6,
    area: 1,
    duration: 0.8,
};

export const WindBlade: WeaponStats = {
    id: "wind_blade",
    name: "Wind Blade",
    baseDamage: 14,
    cooldown: 0.35,
    projectileSpeed: 11,
    area: 0.9,
    duration: 0,
};






