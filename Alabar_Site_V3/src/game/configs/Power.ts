import { PowerUp } from "./PowerUps";

export const AutoLightning = new PowerUp({
    id: "auto_lightning",
    name: "Auto Lightning",
    description: "A lightning bolt strikes random enemies periodically.",
    type: "power",
    value: 40,

    applyEffect: (player) => {
        player.powers.push({
            id: "auto_lightning",
            interval: 2.5,
            timer: 0,
            update(dt) {
                this.timer += dt;
                if (this.timer >= this.interval) {
                    this.timer = 0;
                    player.spawnEffect("lightning", {
                        damage: 40,
                        targets: 2,
                    });
                }
            }
        });
    }
});

export const ArcaneExplosion = new PowerUp({
    id: "arcane_explosion",
    name: "Arcane Explosion",
    description: "A powerful explosion occurs around the player periodically.",
    type: "power",
    value: 80,

    applyEffect: (player) => {
        player.powers.push({
            id: "arcane_explosion",
            interval: 6,
            timer: 0,
            update(dt) {
                this.timer += dt;
                if (this.timer >= this.interval) {
                    this.timer = 0;
                    player.spawnEffect("explosion", {
                        radius: 3,
                        damage: 80,
                    });
                }
            }
        });
    }
});


export const DamageAura = new PowerUp({
    id: "damage_aura",
    name: "Damage Aura",
    description: "Deals damage to all enemies within range every second.",
    type: "power",
    value: 10,

    applyEffect: (player) => {
        player.powers.push({
            id: "damage_aura",
            interval: 1,
            timer: 0,
            update(dt) {
                this.timer += dt;
                if (this.timer >= this.interval) {
                    this.timer = 0;
                    player.spawnEffect("aura_damage", {
                        radius: 2,
                        damage: 10,
                    });
                }
            }
        });
    }
});


export const ProjectileSpeedUp = new PowerUp({
    id: "projectile_speed_up",
    name: "Projectile Speed",
    description: "Increases projectile travel speed.",
    type: "passive",
    value: 0.20,

    applyEffect: (player) => {
        player.stats.projectileSpeed += 0.20;
    }
});

export const ExtraProjectiles = new PowerUp({
    id: "extra_projectiles",
    name: "Extra Projectiles",
    description: "Weapons fire one additional projectile.",
    type: "passive",
    value: 1,

    applyEffect: (player) => {
        player.stats.projectileCount += 1;
    }
});

export const AreaUp = new PowerUp({
    id: "area_up",
    name: "Area Increase",
    description: "Increases the area of all attacks and projectiles.",
    type: "passive",
    value: 0.15,

    applyEffect: (player) => {
        player.stats.areaMultiplier += 0.15;
    }
});

export const FrostPulse = new PowerUp({
    id: "frost_pulse",
    name: "Frost Pulse",
    description: "Emits a freezing pulse that slows nearby enemies.",
    type: "power",
    value: 0,

    applyEffect: (player) => {
        player.powers.push({
            id: "frost_pulse",
            interval: 5,
            timer: 0,
            update(dt) {
                this.timer += dt;
                if (this.timer >= this.interval) {
                    this.timer = 0;
                    player.spawnEffect("frost_pulse", {
                        radius: 3,
                        slow: 0.4,
                        duration: 2,
                    });
                }
            }
        });
    }
});

export const BloodSurge = new PowerUp({
    id: "blood_surge",
    name: "Blood Surge",
    description: "Steals health from all nearby enemies periodically.",
    type: "power",
    value: 8,

    applyEffect: (player) => {
        player.powers.push({
            id: "blood_surge",
            interval: 3.5,
            timer: 0,
            update(dt) {
                this.timer += dt;
                if (this.timer >= this.interval) {
                    this.timer = 0;
                    player.spawnEffect("blood_surge", {
                        radius: 2.5,
                        damage: 8,
                        heal: 8 * 0.5,
                    });
                }
            }
        });
    }
});

export const HolyBeam = new PowerUp({
    id: "holy_beam",
    name: "Holy Beam",
    description: "A holy beam strikes the strongest enemy periodically.",
    type: "power",
    value: 60,

    applyEffect: (player) => {
        player.powers.push({
            id: "holy_beam",
            interval: 7,
            timer: 0,
            update(dt) {
                this.timer += dt;
                if (this.timer >= this.interval) {
                    this.timer = 0;
                    player.spawnEffect("holy_beam", {
                        damage: 60,
                        targetStrongest: true,
                    });
                }
            }
        });
    }
});

export const MeteorDrop = new PowerUp({
    id: "meteor_drop",
    name: "Meteor Drop",
    description: "A meteor falls on a random enemy periodically.",
    type: "power",
    value: 90,

    applyEffect: (player) => {
        player.powers.push({
            id: "meteor_drop",
            interval: 8,
            timer: 0,
            update(dt) {
                this.timer += dt;
                if (this.timer >= this.interval) {
                    this.timer = 0;
                    player.spawnEffect("meteor", {
                        damage: 90,
                        radius: 2.2,
                    });
                }
            }
        });
    }
});

export const ChainLightning = new PowerUp({
    id: "chain_lightning",
    name: "Chain Lightning",
    description: "Lightning jumps between multiple enemies.",
    type: "power",
    value: 35,

    applyEffect: (player) => {
        player.powers.push({
            id: "chain_lightning",
            interval: 3,
            timer: 0,
            update(dt) {
                this.timer += dt;
                if (this.timer >= this.interval) {
                    this.timer = 0;
                    player.spawnEffect("chain_lightning", {
                        damage: 35,
                        jumps: 4,
                    });
                }
            }
        });
    }
});

export const ShurikenFury = new PowerUp({
    id: "shuriken_fury",
    name: "Shuriken Fury",
    description: "Orbiting Shuriken spins faster and deals more damage.",
    type: "passive",

    applyEffect: (player) => {
        player.weaponEffects["orbiting_shuriken"] = {
            damageBonus: 0.25,
            spinSpeedMultiplier: 1.4
        };
    }
});

export const ArcaneBarrage = new PowerUp({
    id: "arcane_barrage",
    name: "Arcane Barrage",
    description: "Ice Shard fires 2 extra homing projectiles.",
    type: "power",

    applyEffect: (player) => {
        player.weaponEffects["ice_shard"] = {
            extraProjectiles: 2
        };
    }
});

export const GaleForce = new PowerUp({
    id: "gale_force",
    name: "Gale Force",
    description: "Wind Blades pierce up to 4 enemies.",
    type: "power",

    applyEffect: (player) => {
        player.weaponEffects["wind_blade"] = {
            pierce: 4
        };
    }
});

export const FlameControl = new PowerUp({
    id: "flame_control",
    name: "Flame Control",
    description: "Fireball explodes on impact, dealing AOE damage.",
    type: "power",

    applyEffect: (player) => {
        player.weaponEffects["fireball"] = {
            explosionRadius: 1.6,
            explosionDamage: 0.6
        };
    }
});




