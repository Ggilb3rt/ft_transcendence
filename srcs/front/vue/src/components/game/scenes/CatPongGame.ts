
import Phaser from "phaser";
import io, {Socket} from "socket.io-client";
import GamePlay from "../tools/GamePlay";

const f = new GamePlay();

export default class CatPongGame extends Phaser.Scene {
	socket: Socket;
	roomName: number;
	level: number;

  constructor() {
    super("CatPongGame");
    //let socket = null;
  }

  init(data) {
    this.userId = data.userId;
    this.spectator = data.spectator;
    this.challenge = data.challenge;
    this.challengeInfo = data.challengeInfo;
	this.key = data.key;
    //this.socket = null;
    this.level = 3;
    this.playerNumber = 0;
    this.roomComplete = false;
    this.activeGame = false;
    this.matchEnded = false;
    this.gameEnded = false;
    this.playerOne = {};
    this.playerTwo = {};
    this.ball = {};
    this.roomName = "";
    this.pauseText = {};
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
    const game = this.sys.game;
    console.log("catponggame");


    /* INIT SOCKET */
    if (!scene.roomComplete) {
      scene.socket = io("http://localhost:3000/game");
    }

    /* GO TO SETTINGS & WAITING ROOM */
    if (!scene.spectator) {
      scene.scene.launch("WaitingRoom", { level: "default", spectator: scene.spectator });
    } else {
      f.watchGame(scene);
	  scene.roomComplete = true;
    }

    /* ADD GAME OBJECTS */
    //if (!scene.roomComplete) {
      f.createGameObjects(
        scene.level,
        null,
        scene.images,
        width,
        height,
        scene
      );
    //}

    /* JOIN QUEUE OR WATCH GAME*/
    if (!scene.spectator && !scene.roomComplete && !scene.challenge) {
      f.joinQueue(scene, scene.level);
    } else if (!scene.spectator && scene.challenge && !scene.roomComplete && scene.playerNumber === 0) {
      scene.socket.emit("createGame", {
        userId: scene.userId,
        challengeInfo: scene.challengeInfo,
		level: scene.level
      });
    }

    /* EVENT LISTENERS */
    //if (!scene.roomComplete) {
      f.addEventListeners(scene.level, width, height, scene, game);
    //}
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
