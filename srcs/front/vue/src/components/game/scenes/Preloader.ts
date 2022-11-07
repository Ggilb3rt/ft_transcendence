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

  init(data) {
    this.userId = data.userId;
    this.spectator = false;
    this.level = data.level;
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
    //console.log("User id " + this.userId);
    //console.log("LEVELLLLL " + this.level);

    /* Quand on arrive dans cette page, trois options :
    ** a) joueur seul qui veut se mettre dans une queue : on recupere son userId qui servira pour la db
    **      et direct on lance la Menu Scene pour qu'il puisse choisir un niveau et se mettre dans une queue
    ** b) joueur qui debarque pour pouvoir voir un match : dans une page precedente, on lui aura montre la liste
    **      de games en cours. Apres sa selection, il arrive sur cette page avec l'info spectator true et la roomName
    **      et le niveau. On recupere ces infos ici puis on lance la partie en question.
    ** c) joueurs qui ont accepte une game : une fois que l'invite + acceptation a ete faire sur une autre page,
    **      un emit est lance de l'autre page pour que la room soit cree. une fois la room cree, on emit vers ces sockets
    **      que la room est prete, puis on les redirige vers cette page. Une fois arrives sur cette page, il faut qu'ils
    **      soient directement rediriges vers le bon level / room avec spectator false.


    scene.scene.launch("MenuScene", {
        userId: scene.userId,
        spectator: scene.specator,
    });



    /* INIT SOCKET */
    //scene.socket = io("http://localhost:3000/game");

    /*if (scene.level === "pong") {
		console.log("level pong");
		scene.scene.launch("DefaultGame", {socket: scene.socket, userId: scene.userId, spectator: scene.spectator})
	} else if (scene.level === "catPong") {
		console.log("level catpong");
		scene.scene.launch("CatPongGame", {socket: scene.socket, userId: scene.userId, spectator: scene.spectator})
	}*/

	

      scene.scene.launch("MenuScene", {
        userId: scene.userId,
        spectator: scene.specator,
		level: scene.level
      });
  }
}
