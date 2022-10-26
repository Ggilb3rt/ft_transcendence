import Phaser from "phaser";
import ballImage from "@/assets/game/ball.png";
import paddleImage from "@/assets/game/paddle.png";

export default class LevelOneScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelOneScene' });
    }

    init(data) { }

    preload() {
        this.load.image("ball", ballImage);
        this.load.image("paddle", paddleImage);
        this.load.image("opponentPaddle", paddleImage);
    }

    create(data) {
       /* createGameObjects(this);
        createScoreObjects(this);
        handleInitGame();
        handleLaunchBall();
        handleMovePlayer();
        handleMoveBall();
        handleAddPoint(this);
        handleEndGame();
        handleGameResult();
        //handleRematch(this);
        handleQuit();*/
    }


}