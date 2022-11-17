import Phaser from "phaser";

import ballDEFAULT from "../assets/balls/default/ball.png";
import p1DEFAULT from "../assets/paddles/default/paddle.png";

import ballBLUE from "../assets/balls/customizable/ballBlue.png";
import ballGREEN from "../assets/balls/customizable/ballGreen.png";
import ballORANGE from "../assets/balls/customizable/ballOrange.png";
import ballYELLOW from "../assets/balls/customizable/ballYellow.png";
import ballWHITE from "../assets/balls/customizable/ballWhite.png";

import p1BLUE from "../assets/paddles/customizable/playerOne/bluePaddle.png";
import p1GREEN from "../assets/paddles/customizable/playerOne/greenPaddle.png";
import p1ORANGE from "../assets/paddles/customizable/playerOne/orangePaddle.png";
import p1YELLOW from "../assets/paddles/customizable/playerOne/yellowPaddle.png";
import p1WHITE from "../assets/paddles/customizable/playerOne/whitePaddle.png";

import p2BLUE from "../assets/paddles/customizable/playerTwo/bluePaddle.png";
import p2GREEN from "../assets/paddles/customizable/playerTwo/greenPaddle.png";
import p2ORANGE from "../assets/paddles/customizable/playerTwo/orangePaddle.png";
import p2YELLOW from "../assets/paddles/customizable/playerTwo/yellowPaddle.png";
import p2WHITE from "../assets/paddles/customizable/playerTwo/whitePaddle.png";

import CPBall from "../assets/balls/catpong/ball.png";
import CPPaddle from "../assets/paddles/catpong/playerOnePaddle.png";
import CPOpponentPaddle from "../assets/paddles/catpong/playerTwoPaddle.png";
import fox_wait from "../assets/spritesheets/waiting_fox.png";

import fox_jump from "../assets/spritesheets/jumping_fox.png";
import fox_run from "../assets/spritesheets/walking_fox.png";

export default class Preloader extends Phaser.Scene {
  constructor() {
    super("Preloader");
  }

  init(data) {
    this.data = data;
    this.userId = data.userId;
    this.spectator = data.spectator;
    this.challenge = data.challenge;
    this.challengeId = data.challengeId;
    this.key = data.key;
    this.level = data.level;
    this.vueSocket = data.vueSocket;
    this.sceneName = "GameScene";
    this.images = {
      ball: "ballDEF",
      playerOne: "p1DEF",
      playerTwo: "p2DEF",
    };
    this.customImages = {
      ball: "ballWHITE",
      playerOne: "p1WHITE",
      playerTwo: "p2WHITE",
    };
    this.catImages = {
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
    this.load.image("ballDEF", ballDEFAULT);
    this.load.image("p1DEF", p1DEFAULT);
    this.load.image("p2DEF", p1DEFAULT);

    this.load.image("ballWHITE", ballWHITE);
    this.load.image("ballBLUE", ballBLUE);
    this.load.image("ballGREEN", ballGREEN);
    this.load.image("ballORANGE", ballORANGE);
    this.load.image("ballYELLOW", ballYELLOW);

    this.load.image("p1WHITE", p1WHITE);
    this.load.image("p1BLUE", p1BLUE);
    this.load.image("p1GREEN", p1GREEN);
    this.load.image("p1ORANGE", p1ORANGE);
    this.load.image("p1YELLOW", p1YELLOW);

    this.load.image("p2WHITE", p2WHITE);
    this.load.image("p2BLUE", p2BLUE);
    this.load.image("p2GREEN", p2GREEN);
    this.load.image("p2ORANGE", p2ORANGE);
    this.load.image("p2YELLOW", p2YELLOW);

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
    console.log("PRELOAD");
    console.log(scene.data);

    if (scene.level == "pong") {
      scene.level = 1;
    } else if (scene.level == "customizable") {
      scene.sceneName = "WaitingRoom";
      scene.level = 2;
      scene.custom = true;
      scene.images = scene.customImages;
    } else if (scene.level == "catPong") {
      scene.level = 3;
      scene.images = scene.catImages;
    }

    scene.scene.start(scene.sceneName, {
      userId: scene.userId,
      spectator: scene.spectator,
      level: scene.level,
      challenge: scene.challenge,
      challengeId: scene.challengeId,
      key: scene.key,
      images: scene.images,
      vueSocket: scene.vueSocket,
      custom: true,
    });
  }
}
