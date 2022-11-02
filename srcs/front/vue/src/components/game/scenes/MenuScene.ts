import Phaser from "phaser";
import io from "socket.io-client";

import defaultBall from "../assets/balls/default/ball.png";
import defaultPaddle from "../assets/paddles/default/paddle.png";
import CPBall from "../assets/balls/catpong/ball.png";
import CPPaddle from "../assets/paddles/catpong/playerOnePaddle.png";
import CPOpponentPaddle from "../assets/paddles/catpong/playerTwoPaddle.png";
import fox_wait from "../assets/spritesheets/waiting_fox.png";
import fox_jump from "../assets/spritesheets/jumping_fox.png";
import fox_run from "../assets/spritesheets/walking_fox.png";

export default class WaitingRoom extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  init(data) {
    this.buttons = [];
  }

  preload() {
	this.load.image("defaultBall", defaultBall);
    this.load.image("defaultPaddle", defaultPaddle);
    this.load.image("defaultOpponentPaddle", defaultPaddle);
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
    });
   }

  create() {
    const scene = this;
    //const { width, height } = this.scale;

    /* INIT SOCKET */
    scene.socket = io("http://localhost:3000/game");


    scene.buttons.push(scene.createButton(140, 215, "DEFAULT", "DefaultGame", scene));
    scene.buttons.push(scene.createButton(140, 315, "CUSTOMIZABLE", "CustomizableGame", scene));
    scene.buttons.push(scene.createButton(140, 415, "CATPONG", "CatPongGame", scene));

    scene.buttons.push(scene.createButton(140, 515, "WATCHGAME", "DefaultGame", scene));
  }

  createButton(width, height, text, dest, scene) {
    let button = scene.add.text(width, height, text, {
      fill: "#ffffff",
      fontSize: "20px",
      fontStyle: "bold",
    });

    button.setInteractive();
    button.on("pointerdown", () => {
        if (text === "WATCHGAME") {
            scene.scene.start(dest, { spectator: true, socket: scene.socket });
        } else {
         scene.scene.start(dest, { spectator: false, socket: scene.socket });
        }
    });
    return button;
  }
}
