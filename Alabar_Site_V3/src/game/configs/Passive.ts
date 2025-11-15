import { PowerUp } from "./PowerUps";

export const MightPowerUp = new PowerUp({
    id: "might",
    name: "Might",
    description: "Increases all damage dealt.",
    type: "passive",
    value: 0.05,
    applyEffect: (player) => {
        player.stats.damageMultiplier += 0.05;
    }
});

export const SpeedPowerUp = new PowerUp({
    id: "speed",
    name: "Move Speed",
    description: "Increases movement speed.",
    type: "passive",
    value: 0.10,
    applyEffect: (player) => {
        player.stats.moveSpeed += 0.10;
    }
});

export const CooldownPowerUp = new PowerUp({
    id: "cooldown",
    name: "Cooldown Reduction",
    description: "Reduces weapon cooldown.",
    type: "passive",
    value: 0.05,
    applyEffect: (player) => {
        player.stats.cooldownReduction += 0.05;
    }
});

export const MaxHealthPowerUp = new PowerUp({
    id: "max_health",
    name: "Max Health",
    description: "Increases maximum health.",
    type: "passive",
    value: 10,
    applyEffect: (player) => {
        player.stats.maxHealth += 10;
    }
});

export const ArmorPowerUp = new PowerUp({
    id: "armor",
    name: "Armor",
    description: "Reduces incoming damage.",
    type: "passive",
    value: 1,
    applyEffect: (player) => {
        player.stats.armor += 1;
    }
});

export const ProjectilePowerUp = new PowerUp({
    id: "projectiles",
    name: "Additional Projectiles",
    description: "Weapons fire one extra projectile.",
    type: "passive",
    value: 1,
    applyEffect: (player) => {
        player.stats.projectileCount += 1;
    }
});
