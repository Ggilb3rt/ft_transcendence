import { Scene } from "phaser";
import bomb from "@/assets/game/bomb.png";

export default class Boot extends Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    init(data) {
      
    }

    preload() {
        this.load.image('bomb', bomb);
    }

    create(data) {
       this.scene.start('PreloaderScene');
    }
}
