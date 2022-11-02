import Phaser from "phaser";
import GamePlay from "../tools/GamePlay";

import eventsCenter from "./EventsCenter";

const f = new GamePlay();

export default class CustomizableGame extends Phaser.Scene {
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

  preload() {}

  create() {
    const scene = this;
    let { width, height } = this.sys.game.canvas;
    console.log("customizablegame");

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
}
