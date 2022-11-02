import Phaser from "phaser";
import GamePlay from "../tools/GamePlay";

import eventsCenter from "./EventsCenter";

/*
import defaultBall from "../assets/balls/default/ball.png";
import defaultPaddle from "../assets/paddles/default/paddle.png";
*/

const f = new GamePlay();

export default class LevelOneScene extends Phaser.Scene {
  constructor() {
    super("CustomizableGame");
  }

  init(data) {
    this.spectator = data.spectator;
    this.socket = data.socket;
    this.level = 2;
    this.playerNumber = 0;
    this.joinQueue = false;
    this.activeGame = false;
    this.matchEnded = false;
    this.gameEnded = false;
    this.playerOne = {};
    this.playerTwo = {};
    this.ball = {};
    this.roomId = "";
    this.roomName = "";
	this.playerOneScore = 0;
	this.playerTwoScore = 0;
    this.playerOneScoreText = {};
    this.playerTwoScoreText = {};
    this.settingsOK = false;
    this.p1oldposy;
    this.p2oldposy;
    this.images = {
      ball: "defaultBall",
      playerOne: "defaultPaddle",
      playerTwo: "defaultOpponentPaddle",
    };
  }

  preload() {
	/*
    this.load.image("defaultBall", defaultBall);
    this.load.image("defaultPaddle", defaultPaddle);
    this.load.image("defaultOpponentPaddle", defaultPaddle);
	*/
 
}

  create() {
    const scene = this;
    let { width, height } = this.sys.game.canvas;

    /* GO TO SETTINGS & WAITING ROOM UNLESS SPECTATOR*/
    if (!scene.spectator) {
      scene.scene.launch("WaitingRoom", { level: "customizable" });
    } else {
        f.watchGame(scene);
      }
    

    /* ADD GAME OBJECTS */
    eventsCenter.on("settingsOK", (settings) => {
      scene.settingsOK = true;
      f.createGameObjects(
        scene.level,
        settings,
        scene.images,
        width,
        height,
        scene
      );
    });

   

    /* EVENT LISTENERS */
    f.addEventListeners(scene.level, width, height, scene);
  }

  update() {
    const scene = this;
	const { width, height } = this.sys.game.canvas;

    if (scene.settingsOK && !scene.joinQueue) {
      f.joinQueue(scene, scene.level);
      scene.joinQueue = true;
    }

    if (scene.activeGame) {
      f.moveBall(scene);
      f.checkPlayerMovement(scene);
      f.checkPoints(scene.level, width, height, scene);
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
