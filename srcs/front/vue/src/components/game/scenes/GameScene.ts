import Phaser from "phaser";
import io from "socket.io-client";
import GamePlay from "../tools/GamePlay";

const f = new GamePlay();

export default class DefaultGame extends Phaser.Scene {
  socket: Socket;
  roomName: number;
  level: number;

  constructor() {
    super("DefaultGame");
    //this.socket = null;
  }

  init(data) {
    this.userId = data.userId;
    this.spectator = data.spectator;
    this.challenge = data.challenge;
    this.challengeInfo = data.challengeInfo;
	this.key = data.key;
    //this.socket = null;
    this.level = 1;
    this.roomComplete = false;
    this.playerInit = false;
    this.playerNumber = 0;
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
    this.p1oldposy;
    this.p2oldposy;
    this.images = {
      ball: "defaultBall",
      playerOne: "defaultPaddle",
      playerTwo: "defaultOpponentPaddle",
    };
  }

  preload() {}

  create() {
    const scene = this;
    const { width, height } = this.sys.game.canvas;
    const game = this.sys.game;
    console.log("defaultgame");
    console.log("socket " + this.socket);
	console.log("userId " + scene.userId)

	
    /* INIT SOCKET */
    if (!scene.roomComplete) {
		console.log('init socket here');
		scene.socket = io("http://localhost:3000/game");
    }

    /* GO TO WAITING ROOM UNLESS SPECTATOR*/
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
    /* JOIN QUEUE OR CREATE GAME*/	
    if (!scene.spectator && !scene.roomComplete && !scene.challenge) {
      f.joinQueue(scene, scene.level);
    } else if (
      !scene.spectator &&
      !scene.roomComplete &&
      scene.challenge &&
      scene.playerNumber === 0
    ) {
      console.log("CREATE GAME");
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

    if (scene.activeGame) {
      f.moveBall(scene);
      f.checkPlayerMovement(scene);
      f.checkPoints(scene.level, width, height, scene);
    }
  }
}
