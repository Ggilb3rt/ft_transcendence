import Phaser from "phaser";
import GamePlay from "../tools/GamePlay";

import defaultBall from "../assets/balls/default/ball.png";
import defaultPaddle from "../assets/paddles/default/paddle.png";

const f = new GamePlay();

export default class LevelOneScene extends Phaser.Scene {
  constructor() {
    super("DefaultGame");
  }

  init(data) {
    this.spectator = data.spectator;
    this.level = 1;
    this.socket = data.socket;
    this.playerNumber = 0;
    this.activeGame = false;
    this.matchEnded = false;
    this.gameEnded = false;
    this.playerOne = {};
    this.playerTwo = {};
    this.ball = {};
    this.roomName = "";
    this.playerOneScoreText = {};
    this.playerTwoScoreText = {};
    this.p1oldposy;
    this.p2oldposy;
    this.images = {
        ball: "defaultBall",
        playerOne: "defaultPaddle",
        playerTwo: "defaultOpponentPaddle"
    }
  }

  preload() {
    this.load.image("defaultBall", defaultBall);
    this.load.image("defaultPaddle", defaultPaddle);
    this.load.image("defaultOpponentPaddle", defaultPaddle);
  }

  create() {
    const scene = this;
    let { width, height } = this.sys.game.canvas;

    if (!scene.spectator) {
      scene.scene.launch("WaitingRoom", { level: "default" });
    }

    /* ADD GAME OBJECTS */
    f.createGameObjects(scene.level, null, scene.images, width, height, scene);

    /* JOIN QUEUE */
    f.joinQueue(scene, scene.level);

    /* EVENT LISTENERS */
    f.addEventListeners(width, height, scene);
  }

  update() {
    const scene = this;

    if (scene.activeGame) {
      f.moveBall(scene);
      f.checkPlayerMovement(scene);
      f.checkPoints(scene);
    }
  }

  /* HELPER FUNCTIONS FOR DRAGABLE PADDLES */

  startDragPlayerOne(pointer, targets) {
    this.input.off("pointerdown", this.startDragPlayerOne, this);
    this.input.on("pointermove", this.doDragPlayerOne, this);
    this.input.on("pointerup", this.stopDragPlayerOne, this);
  }

  startDragPlayerTwo(pointer, targets) {
    this.input.off("pointerdown", this.startDragPlayerTwo, this);
    this.input.on("pointermove", this.doDragPlayerTwo, this);
    this.input.on("pointerup", this.stopDragPlayerTwo, this);
  }

  doDragPlayerOne(pointer) {
    if (this.playerNumber === 1) {
      this.playerOne.y = pointer.y;
    }
  }
  doDragPlayerTwo(pointer) {
    if (this.playerNumber === 2) {
      this.playerTwo.y = pointer.y;
    }
  }

  stopDragPlayerOne(pointer, targets) {
    this.input.on("pointerdown", this.startDragPlayerOne, this);
    this.input.off("pointermove", this.doDragPlayerOne, this);
    this.input.off("pointerup", this.stopDragPlayerOne, this);
  }

  stopDragPlayerTwo(pointer, targets) {
    this.input.on("pointerdown", this.startDragPlayerTwo, this);
    this.input.off("pointermove", this.doDragPlayerTwo, this);
    this.input.off("pointerup", this.stopDragPlayerTwo, this);
  }
}
