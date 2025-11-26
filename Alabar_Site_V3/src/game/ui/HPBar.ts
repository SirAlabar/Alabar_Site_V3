import { Container, Graphics } from "pixi.js";

export class HPBar extends Container 
{
    // private border: Graphics;
    private background: Graphics;
    private fill: Graphics;

    private widthBar = 20;
    private heightBar = 3;

    constructor() 
    {
        super();

        this.background = new Graphics();
        this.background.alpha = 0.4; 
        this.background.rect(0, 0, this.widthBar, this.heightBar).fill(0x000000);
        this.addChild(this.background);

        // this.border = new Graphics();
        // this.border
        //     .rect(-1, -1, this.widthBar + 2, this.heightBar + 2)
        //     .stroke({ width: 1, color: 0xffff00 });
        // this.addChild(this.border);

        this.fill = new Graphics();
        this.addChild(this.fill);

        this.update(1);
    }

    update(percent: number) 
    {
        percent = Math.max(0, Math.min(1, percent));

        this.fill.clear();


        const color =
            percent > 0.5 ? 0x00ff00 :      
            percent > 0.25 ? 0xffff00 :    
            0xff0000;                       


        this.fill
            .rect(0, 0, this.widthBar * percent, this.heightBar)
            .fill(color);
    }
}
