import { Container, Graphics } from "pixi.js";

export class XPBar extends Container 
{
    private background: Graphics;
    private fill: Graphics;

    private widthBar = 20;
    private heightBar = 3;

    constructor() 
    {
        super();

        this.background = new Graphics();
        this.background.alpha = 0.35;
        this.background.rect(0, 0, this.widthBar, this.heightBar).fill(0x000000);
        this.addChild(this.background);

        this.fill = new Graphics();
        this.addChild(this.fill);

        this.update(0);
    }

    update(percent: number) 
    {
        percent = Math.max(0, Math.min(1, percent));

        this.fill.clear();

        const baseBlue = 0x0077ff;
        const lightBlue = 0x33aaff;

        this.fill
            .rect(0, 0, this.widthBar * percent, this.heightBar)
            .fill({
                color: baseBlue,
            })
            .stroke({
                width: 1,
                color: lightBlue,
                alpha: 0.7
            });
    }
}
