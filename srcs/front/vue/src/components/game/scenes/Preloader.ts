import Phaser from 'phaser';
//import ball from "@/assets/game/ball.png"

export default class Preloader extends Phaser.Scene {
    constructor() {
        super ({ key: 'PreloaderScene' });
    }

    init(data) {}

    preload() {
        this.add.image(400, 300, 'bomb');
       // this.load.image('ball', ball);
    
    }

    create() {
        const startButton = this.add.text(400, 450, 'START');
        startButton.setInteractive();
        startButton.setOriginFromFrame();
        startButton.on('pointerup', () => this.scene.start('MenuScene'));
    }
}

