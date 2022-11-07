import Phaser from "phaser";
import io from "socket.io-client";
import GamePlay from "../tools/GamePlay";

const f = new GamePlay();

export default class CatPongGame extends Phaser.Scene {
  constructor() {
    super("CatPongGame");
  }

  init(data) {
	this.userId = data.userId;
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
    this.p1oldposy;
    this.p2oldposy;
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

  preload() {}

  create() {
    const scene = this;
    const { width, height } = this.sys.game.canvas;
    console.log("catponggame");

	/* INIT SOCKET */
	//scene.socket = io("http://localhost:3000/game");

    /* GO TO SETTINGS & WAITING ROOM */
    if (!scene.spectator) {
      scene.scene.launch("WaitingRoom", { level: "default" });
    } else {
      f.watchGame(scene);
    }

    /* ADD GAME OBJECTS */
    f.createGameObjects(scene.level, null, scene.images, width, height, scene);

    /* JOIN QUEUE OR WATCH GAME*/
    if (!scene.spectator) {
      f.joinQueue(scene, scene.level);
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
}
