import Phaser from "phaser";
import io, { Socket } from "socket.io-client";
import GamePlay from "../tools/GamePlay";

const f = new GamePlay();

export default class GameScene extends Phaser.Scene {
  socket: Socket;
  spectator: boolean;
  level: number;

  constructor() {
    super("GameScene");
  }

  init(data) {
    this.userId = data.userId;
    this.spectator = data.spectator;
    this.challenge = data.challenge;
    this.challengeInfo = data.challengeInfo;
    this.challengeId = data.challengeId;
    this.key = data.key;
    this.images = data.images;
    this.custom = data.custom;
    this.level = data.level;
    this.settings = data.settings;
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
    this.fox = {};
    this.foxSpeed = 100;
    this.foxVelocityLeftUP = -this.foxSpeed;
    this.foxVelocityRightDown = this.foxSpeed;
    this.foxLimitLeft = 230;
    this.foxLimitRight = 800 - this.foxLimitLeft;
  }

  preload() {}

  create() {
    const scene = this;
    const { width, height } = this.sys.game.canvas;
    const game = this.sys.game;
    console.log("level = " + scene.level);

    /* INIT SOCKET */
    if (!scene.roomComplete) {
      scene.socket = io("http://localhost:3000/game");
		//alert("INIT 2");
	}

    /* GO TO WAITING ROOM UNLESS SPECTATOR*/
    if (!scene.spectator) {
      console.log("NOT SPECTATOR");
      scene.scene.launch("WaitingRoom", {
        level: scene.level,
        userId: scene.userId,
        spectator: scene.spectator,
        challenge: scene.challenge,
        challengeInfo: scene.challengeInfo,
        key: scene.key,
        images: scene.images,
        settings: scene.settings,
        custom: false,
      });
    } else {
      console.log("SPECTATOR");
      f.watchGame(scene);
      scene.roomComplete = true;
    }

    /* ADD GAME OBJECTS */
    f.createGameObjects(
      scene.level,
      scene.settings,
      scene.images,
      width,
      height,
      scene
    );

    /* JOIN QUEUE OR JOIN EXISTING GAME*/
    if (!scene.spectator && !scene.roomComplete && !scene.challenge) {
      f.joinQueue(scene, scene.level);
    } else if (!scene.spectator && !scene.roomComplete && scene.challenge) {
      scene.roomName = scene.challengeId;
      this.socket.emit("initGame", {
        roomId: scene.roomName,
        userId: scene.userId,
      });
    }

    /* EVENT LISTENERS */
    f.addEventListeners(scene.level, width, height, scene, game);
  }

  update() {
    const scene = this;
    const { width, height } = this.sys.game.canvas;

    if (scene.activeGame) {
      f.moveBall(scene);
      if (scene.level === 3) {
        f.moveAnim(scene);
      }
      f.checkPlayerMovement(scene);
      f.checkPoints(scene.level, width, height, scene);
    }
  }
}
