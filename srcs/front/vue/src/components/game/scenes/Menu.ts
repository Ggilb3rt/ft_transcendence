import Phaser from "phaser";
//import ball from "../assets/ball.png"
import levelOne from "../assets/levelOneButton.png"

export default class Menu extends Phaser.Scene {
    constructor () {
        super({ key: 'MenuScene'});
    }

    init(data) {}

    preload() {
        this.load.image('levelOne', levelOne);
       // this.physics.add.sprite(this.physics.world.bounds.width / 2,
        //this.physics.world.bounds.height / 2,
        //"ball")
        
    }

    create(data) {
        this.add.text(10, 10, 'MENU', { font: '48px Arial'});
        const levelOneButton = this.add.image(400, 300, 'levelOne');
        levelOneButton.setInteractive();
        levelOneButton.setOriginFromFrame();

        levelOneButton.on('pointerup', () => this.scene.start('LevelOneScene'));
    }

    //update(time, delta) {}
}
