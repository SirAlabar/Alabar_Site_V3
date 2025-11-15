export type PowerUpType = "power" | "weapon" | "passive" ;

export interface PowerUpEffect {
    (player: any): void;
}

export class PowerUp {
    id: string;
    name: string;
    description: string;
    type: PowerUpType;

    level: number;
    maxLevel: number;

    value: number;

    applyEffect: PowerUpEffect;

    constructor(config: {
        id: string;
        name: string;
        description: string;
        type: PowerUpType;
        maxLevel?: number;
        value?: number;
        applyEffect: PowerUpEffect;
    }) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.type = config.type;

        this.level = 0;
        this.maxLevel = config.maxLevel ?? 5;
        this.value = config.value ?? 1;

        this.applyEffect = config.applyEffect;
    }

    canLevelUp(): boolean {
        return this.level < this.maxLevel;
    }

    levelUp(player: any): void {
        if (!this.canLevelUp()) return;

        this.level++;

        this.applyEffect(player);
    }
}


