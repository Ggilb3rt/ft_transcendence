import Phaser from "phaser";

import defaultBall from "../assets/balls/default/ball.png";
import defaultPaddle from "../assets/paddles/default/paddle.png";
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
    this.key = data.key;
    this.level = data.level;
    this.challengeInfo = data.challengeInfo;
    this.sceneName = "GameScene";
    this.images = {
      ball: "defaultBall",
      playerOne: "defaultPaddle",
      playerTwo: "defaultOpponentPaddle",
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
    console.log("PRELOAD");
    console.log(scene.data);

    if (
      scene.level == "pong" ||
      (scene.challenge === true && scene.challengeInfo.level === 0)
    ) {
      scene.level = 1;
    } else if (
      scene.level == "customizable" ||
      (scene.challenge === true && scene.challengeInfo.level === 2)
    ) {
      scene.sceneName = "WaitingRoom";
      scene.level = 2;
    } else if (
      scene.level == "catPong" ||
      (scene.challenge === true && scene.challengeInfo.level === 1)
    ) {
      scene.level = 3;
      scene.images = scene.catImages;
    }

    scene.scene.start(scene.sceneName, {
      userId: scene.userId,
      spectator: scene.spectator,
      level: scene.level,
      challenge: scene.challenge,
      challengeInfo: scene.challengeInfo,
      key: scene.key,
      images: scene.images,
      custom: true,
    });
  }
}
