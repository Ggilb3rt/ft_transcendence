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

export default class Preloader extends Phaser.Scene {
	constructor() {
	  super("Preloader");
	}
  
	init() {}
  
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
  
	  /* INIT SOCKET */
		scene.socket = io("http://localhost:3000/game");

		scene.scene.start("MenuScene", {socket: scene.socket});
	}
  }
  