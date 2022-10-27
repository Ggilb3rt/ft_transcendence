import Phaser from "phaser";
import io from "socket.io-client";

import ballImage from "@/assets/game/ball.png";
import paddleImage from "@/assets/game/paddle2.png";
import middleLine from "@/assets/game/middleLine.png";

export default class LevelOneScene extends Phaser.Scene {
  constructor() {
    super("LevelOneScene");
    this.playerNumber;
    this.roomId;
    this.level;
    this.cursors;
    this.ball;
    this.playerOne = {
      y: 0,
      oldPosition: {
        y: 0,
      },
    };
    this.playerTwo;
    this.victoryText;
    this.looserText;
    this.ballHeight;
    this.ballWidth;
    this.state = {};
    //this.vendingMachineStatus = false;
  }

  init() {
    //this.socket = data.socket;
  }

  preload() {
    this.load.image("ball", ballImage);
    this.load.image("paddle", paddleImage);
    this.load.image("opponentPaddle", paddleImage);
    this.load.image("middleLine", middleLine);
  }

  create() {
    const scene = this;
    let { width, height } = this.sys.game.canvas;

    this.socket = io("http://localhost:3000/game");

    scene.createGameObjects(width, height, scene);

    scene.waitingText = scene.add.text(
      140,
      215,
      "LEVEL ONE SCENE... Waiting for another player",
      {
        fill: "#ffffff",
        fontSize: "20px",
        fontStyle: "bold",
      }
    );

    scene.socket.emit("joinQueue", { level: 1 });
    scene.socket.on("init", (data) => {
      console.log(data.playerNumber);
      scene.playerNumber = data.playerNumber;
      scene.roomId = data.gameCode;
      scene.level = data.level;
    });

    scene.socket.on("roomComplete", (state) => {
        console.log("STATE");
      console.log(state);
      scene.state = state;
      scene.waitingText.setVisible(false);
      scene.readyText = scene.add.text(
        140,
        215,
        "LEVEL ONE SCENE... ROOM COMPLETE",
        {
          fill: "#ffffff",
          fontSize: "20px",
          fontStyle: "bold",
        }
      );
    });

    scene.socket.on("playerMoved", (playerInfo) => {
      this.playerOne.y = playerInfo.y;
    });
  }

  // https://hannahrobot.com/2020/12/15/build-among-us-live-multiplayer-phaser-3-socket-part-3/
  // https://github.com/hannahrobot/amongus-tutorial/blob/main/server/socket/index.js


  update() {
    const scene = this;

    scene.movePlayers(scene);

    if (scene.playerOne) {
      const speed = 225;
      let playerMoved = false;
      this.playerOne.body.setVelocity(0);
      if (this.cursors.up.isDown) {
        this.playerOne.body.setVelocityY(-speed);
        playerMoved = true;
      } else if (this.cursors.down.isDown) {
        this.playerOne.body.setVelocityY(speed);
        playerMoved = true;
      }
      if (playerMoved === true) {
        console.log("player Moved");
         this.socket.emit("playerMovement", {
                y: this.playerOne.y,
        roomKey: scene.roomId,
        });
    }
    }
  }

  movePlayers(scene)


  createGameObjects(width, height, scene) {
    // Create middle line
    let middleLine = scene.add.image(width / 2, height / 2, "middleLine");
    middleLine.setScale(0.8);
    middleLine.scaleY = middleLine.scaleX;

    // Create and add BALL
    scene.ball = scene.physics.add.sprite(width / 2, height / 2, "ball");
    scene.ball.setCollideWorldBounds(true);
    scene.ball.setBounce(1, 1);
    scene.ballWidth = scene.ball.body.width;
    scene.ballHeight = scene.ball.body.height;
    scene.ball.scaleY = scene.ball.scaleX;

    // Create and add PLAYER 1
    scene.playerOne = scene.physics.add.sprite(
      scene.ball.body.width / 2 + 1,
      height / 2,
      "paddle"
    );
    scene.playerOne.setCollideWorldBounds(true);
    scene.playerOne.setImmovable(true);
    scene.playerOne.setInteractive();
    //gameState.playerOne.displayWidth = 0;
    scene.playerOne.setScale(0.5);
    scene.playerOne.scaleY = scene.playerOne.scaleX;

    // Create and add PLAYER 2
    scene.playerTwo = scene.physics.add.sprite(
      width - (scene.ball.body.width / 2 + 1),
      height / 2,
      "opponentPaddle"
    );
    scene.playerTwo.setCollideWorldBounds(true);
    scene.playerTwo.setImmovable(true);
    scene.playerTwo.setInteractive();
    //gameState.playerTwo.displayWidth = 0;
    scene.playerTwo.setScale(0.5);
    scene.playerTwo.scaleY = scene.playerTwo.scaleX;

    // Init collision between ball and paddles
    scene.physics.add.collider(scene.ball, scene.playerOne);
    scene.physics.add.collider(scene.ball, scene.playerTwo);

    // Init KEY EVENT listeners
    scene.cursors = scene.input.keyboard.createCursorKeys();

    // Init CLICK EVENT listeners
    //scene.playerOne.on("pointerdown", startDrag1, game);
    //scene.playerTwo.on("pointerdown", startDrag2, game);
  }
}
