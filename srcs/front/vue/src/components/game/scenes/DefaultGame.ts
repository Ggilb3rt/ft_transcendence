import Phaser from "phaser";
import io from "socket.io-client";
import GamePlay from "../tools/GamePlay";

const f = new GamePlay();

export default class DefaultGame extends Phaser.Scene {
  constructor() {
    super("DefaultGame");
	let socket;
  }

  init(data) {
	this.userId = data.userId;
    this.spectator = data.spectator;
	this.socket = null;
    this.level = 1;
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

	/* INIT SOCKET */
	scene.socket = io("http://localhost:3000/game");

    /* GO TO WAITING ROOM UNLESS SPECTATOR*/
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
    f.addEventListeners(scene.level, width, height, scene, game);
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
