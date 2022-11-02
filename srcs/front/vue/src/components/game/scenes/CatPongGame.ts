import Phaser from "phaser";
import GamePlay from "../tools/GamePlay";
/*
import CPBall from "../assets/balls/catpong/ball.png";
import CPPaddle from "../assets/paddles/catpong/playerOnePaddle.png";
import CPOpponentPaddle from "../assets/paddles/catpong/playerTwoPaddle.png";
import fox_wait from "../assets/spritesheets/waiting_fox.png";
import fox_jump from "../assets/spritesheets/jumping_fox.png";
import fox_run from "../assets/spritesheets/walking_fox.png";
*/

const f = new GamePlay();

export default class LevelOneScene extends Phaser.Scene {
  constructor() {
    super("CatPongGame");
  }

  init(data) {
    this.spectator = data.spectator;
    this.socket = data.socket;
    this.level = 3;
    this.playerNumber = 0;
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
    this.fox = {};
    this.foxSpeed = 100;
    this.foxVelocityLeftUP = -this.foxSpeed;
    this.foxVelocityRightDown = this.foxSpeed;
    this.foxLimitLeft = 230;
    this.foxLimitRight = 800 - this.foxLimitLeft;
    this.images = {
      ball: "CPBall",
      playerOne: "CPPaddle",
      playerTwo: "CPOpponentPaddle",
      fox: {
        wait: "fox_wait",
        jump: "fox_jump",
        run: "fox_run",
      },
    };
  }

  preload() {
	/*
    this.load.image("CPBall", CPBall);
    this.load.image("CPPaddle", CPPaddle);
    this.load.image("CPOpponentPaddle", CPOpponentPaddle);
    this.load.spritesheet("fox_wait", fox_wait, {
      frameWidth: 161 / 5,
      frameHeight: 15,
    });
    this.load.spritesheet("fox_run", fox_run, {
      frameWidth: 256 / 8,
      frameHeight: 16,
    });
    this.load.spritesheet("fox_jump", fox_jump, {
      frameWidth: 352 / 11,
      frameHeight: 18,
    });*/
  }

  create() {
    const scene = this;
    const { width, height } = this.sys.game.canvas;

    /* GO TO SETTINGS & WAITING ROOM */
    if (!scene.spectator) {
      scene.scene.launch("WaitingRoom", { level: "default" });
    }

    /* ADD GAME OBJECTS */
    f.createGameObjects(scene.level, null, scene.images, width, height, scene);

    /* JOIN QUEUE OR WATCH GAME*/
    if (!scene.spectator) {
      f.joinQueue(scene, scene.level);
    } else {
      f.watchGame(scene);
    }

    /* EVENT LISTENERS */
    f.addEventListeners(scene.level, width, height, scene);
  }

  update() {
    const scene = this;
    const { width, height } = this.sys.game.canvas;

    f.moveBall(scene);
    f.moveAnim(scene);
    f.checkPlayerMovement(scene);
    f.checkPoints(scene.level, width, height, scene);
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
