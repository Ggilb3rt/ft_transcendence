import Phaser, { ScaleModes, Scene } from "phaser";
import io from "socket.io-client";

import eventsCenter from "./EventsCenter";

import ball from "../assets/balls/catpong/ball.png";
import p1 from "../assets/paddles/catpong/playerOnePaddle.png";
import p2 from "../assets/paddles/catpong/playerTwoPaddle.png";
import cat from "../assets/spritesheets/cat.png";
import fox_wait from "../assets/spritesheets/waiting_fox.png";
import fox_jump from "../assets/spritesheets/jumping_fox.png";
import fox_watch from "../assets/spritesheets/waiting_watching_fox.png";
import fox_run from "../assets/spritesheets/walking_fox.png";
import star from "../assets/others/star.png";

export default class LevelOneScene extends Phaser.Scene {
  constructor() {
    super("CatPongGame");
    this.playerNumber;
    this.activeGame = false;
    this.matchEnded = false;
    this.state = {};
    this.foxSpeed = 100;
    this.foxVelocityLeftUP = -this.foxSpeed;
    this.foxVelocityRightDown = this.foxSpeed;
    this.foxLimitLeft = 230;
    this.foxLimitRight = 800 - this.foxLimitLeft;
  }

  init(data) {
    this.spectator = data.spectator;
  }

  preload() {
    this.load.image("ball", ball);
    this.load.image("paddle", p1);
    this.load.image("opponentPaddle", p2);
    this.load.image("star", star);
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
    this.load.spritesheet("fox_watch", fox_watch, {
      frameWidth: 448 / 14,
      frameHeight: 15,
    });
  }

  create() {
    const scene = this;
    const { width, height } = this.sys.game.canvas;

    /* INIT SOCKET */
    scene.socket = io("http://localhost:3000/game");

    if (!scene.spectator) {
      scene.scene.launch("WaitingRoom", { level: "default" });
    }

    /* ADD GAME OBJECTS */
    scene.createGameObjects(width, height, scene);

    /* EVENT LISTENERS */

    // When a socket arrives to this scene, it joins a queue to wait for a second player
    if (!scene.spectator) {
      scene.socket.emit("joinQueue", { level: 3 });
    } else {
      scene.socket.emit("watchGame");
      scene.socket.on("upDateInfo", (data) => {
        scene.playerNumber = 3;
        scene.roomId = data.roomName;
        scene.playerOneScoreText.setText(data.players[0].match_score);
        scene.playerTwoScoreText.setText(data.players[1].match_score);
      });
    }

    // When two sockets are connected, a room is created. The first one on the queue will
    // become playerOne and the second one playerTwo. The room is given a roomName
    scene.socket.on("init", (data) => {
      scene.playerNumber = data.playerNumber;
      scene.roomName = data.gameCode;
    });

    // When giving specific info to each player is done, we can start the game
    scene.socket.on("roomComplete", (state) => {
      eventsCenter.emit("ready");
      scene.state = state;
      scene.time.delayedCall(3000, function () {
        scene.startGame(scene);
      });
    });

    scene.socket.on("launchBall", (data) => {
      if (scene.playerNumber === 1) {
        scene.launchBall(data, scene);
      }
    });

    scene.socket.on("ballMoved", (data) => {
      if (scene.playerNumber !== 1) {
        scene.ball.x = data.x + scene.ball.body.width / 2 + 2;
        scene.ball.y = data.y + scene.ball.body.height / 2 + 2;
      }
    });

    scene.socket.on("animMoved", (data) => {
      if (scene.playerNumber !== 1) {
        scene.fox.x = data.x + scene.fox.body.width / 2 + 2;
        scene.fox.y = data.y + scene.fox.body.height / 2 + 2;
      }
    });

    // When a player moves, we change its position here ONLY for the opponent
    scene.socket.on("playerMoved", (data) => {
      const { y, roomName, playerNumber } = data;
      if (playerNumber === 1 && playerNumber !== scene.playerNumber) {
        scene.playerOne.y = y;
      } else if (playerNumber === 2 && playerNumber !== scene.playerNumber) {
        scene.playerTwo.y = y;
      }
    });

    scene.socket.on("addPoint", (data) => {
      const { playerNumber, score } = data;
      if (playerNumber === 1) {
        scene.playerOneScore = score;
        scene.playerOneScoreText.setText(scene.playerOneScore);
      } else if (playerNumber === 2) {
        scene.playerTwoScore = score;
        scene.playerTwoScoreText.setText(scene.playerTwoScore);
      }
      //scene.ball.setPosition(width / 2, height / 2);

      scene.ball.x = width / 2;
      scene.ball.y = height / 2;
      scene.playerOne.y = height / 2;
      scene.playerTwo.y = height / 2;
      scene.fox.x = width / 2 - 20;
      scene.fox.y = height / 2 - 50;
      scene.playerOne.setScale(1);
      scene.playerTwo.setScale(1);
      scene.playerOne.displayWidth = 20;
      scene.playerTwo.displayWidth = 20;

      scene.time.delayedCall(1000, function () {
        scene.activeGame = true;
        if (scene.playerNumber === 1) {
          scene.socket.emit("launchBall", { roomName: scene.roomName });
        }
      });
    });

    scene.socket.on("gameResult", (data) => {
      scene.resultText = scene.add
        .text(
          width / 2 - 125,
          height / 2,
          "PLAYER " + data.winner + " WINS !",
          {
            fontSize: "36px",
          }
        )
        .setVisible(true);
      scene.gameEnded = true;
    });

    scene.socket.on("leftGame", (type) => {
      if (type === 1) {
        console.log("a player disconnected");
        scene.scene.start("MenuScene");
      } else if (type === 2) {
        console.log("a player quit");
      }
      this.activeGame = false;
      this.matchEnded = false;
      eventsCenter.emit("quit");
      scene.scene.start("MenuScene");
    });

    scene.socket.on("rematch", (type) => {
      scene.scene.restart();
    });
  }

  update() {
    const scene = this;
    const { width, height } = this.sys.game.canvas;

    scene.moveBall(scene);
    scene.moveAnim(scene);
    scene.checkPlayerMovement(scene);
    scene.checkPoints(width, height, scene);
  }

  startGame(scene) {
    scene.activeGame = true;
    if (scene.playerNumber === 1) {
      scene.socket.emit("launchBall", { roomName: scene.roomName });
    }
  }

  launchBall(data, scene) {
    scene.ball.setImmovable(false);
    //scene.fox.setImmovable(false);
    scene.ball.setVelocityX(data.ball.initialVelocity.x);
    scene.ball.setVelocityY(data.ball.initialVelocity.y);
  }

  moveBall(scene) {
    if (scene.playerNumber === 1 && scene.activeGame) {
      scene.socket.emit("moveBall", {
        roomName: scene.roomName,
        x: scene.ball.body.x,
        y: scene.ball.body.y,
      });
    }
  }

  moveAnim(scene) {
    if (scene.activeGame) {
      scene.fox.setVelocity(0);
      const fx = scene.fox.body.x;
      const fy = scene.fox.body.y;
      const bx = scene.ball.body.x;
      const by = scene.ball.body.y;

      const distance = Phaser.Math.Distance.Between(fx, fy, bx, by);
      if (distance > 300) {
        if (Math.random() > 0.5) {
          scene.fox.anims.play("jump_fox", true);
        }
      } else scene.fox.anims.play("run_fox", true);

      const rotation = Phaser.Math.Angle.Between(fx, fy, bx, by);
      scene.fox.setRotation(rotation);
      if (scene.playerNumber === 1) {
        if (
          rotation >= 0 &&
          rotation <= Math.PI / 2 &&
          fx < scene.foxLimitRight
        ) {
          scene.fox.setVelocity(
            scene.foxVelocityRightDown,
            scene.foxVelocityRightDown
          );
        } else if (
          rotation > Math.PI / 2 &&
          rotation <= Math.PI &&
          fx > scene.foxLimitLeft
        )
          scene.fox.setVelocity(
            scene.foxVelocityLeftUP,
            scene.foxVelocityRightDown
          );
        else if (
          rotation < 0 &&
          rotation >= -Math.PI / 2 &&
          fx < scene.foxLimitRight
        )
          scene.fox.setVelocity(
            scene.foxVelocityRightDown,
            scene.foxVelocityLeftUP
          );
        else if (
          rotation < -Math.PI / 2 &&
          rotation > -Math.PI &&
          fx > scene.foxLimitLeft
        )
          scene.fox.setVelocity(
            scene.foxVelocityLeftUP,
            scene.foxVelocityLeftUP
          );
        else scene.fox.setVelocity(0, 0);
        scene.socket.emit("moveAnim", {
          roomName: scene.roomName,
          x: scene.fox.body.x,
          y: scene.fox.body.y,
        });
      }
    }
  }

  checkPoints(width, height, scene) {
    if (scene.activeGame) {
      if (scene.ball.body.x < scene.playerOne.body.x) {
        scene.activeGame = false;
        scene.ball.setVelocity(0);
        scene.ball.setImmovable(true);
        scene.playerOne.setVelocity(0);
        scene.playerTwo.setVelocity(0);
        scene.fox.setVelocity(0);
        if (scene.playerNumber === 1) {
          scene.socket.emit("addPoint", {
            roomName: scene.roomName,
            player: 2,
          });
        }
      }
      if (scene.ball.x > scene.playerTwo.body.x) {
        scene.activeGame = false;
        scene.ball.setVelocity(0);
        scene.ball.setImmovable(true);
        scene.playerOne.setVelocity(0);
        scene.playerTwo.setVelocity(0);
        scene.fox.setVelocity(0);
        if (scene.playerNumber === 1) {
          scene.socket.emit("addPoint", {
            roomName: scene.roomName,
            player: 1,
          });
        }
      }
    }
  }

  /* HELPER FUNCTIONS */

  // PLAYER MOVEMENT
  checkPlayerMovement(scene) {
    if (scene.playerNumber === 1 && scene.activeGame) {
      if (scene.playerMoved(scene.playerOne, scene)) {
        scene.socket.emit("playerMovement", {
          y: scene.playerOne.y,
          roomName: scene.roomName,
          playerNumber: scene.playerNumber,
        });
      }
    } else if (scene.playerNumber === 2 && scene.activeGame) {
      if (scene.playerMoved(scene.playerTwo, scene)) {
        scene.socket.emit("playerMovement", {
          y: scene.playerTwo.y,
          roomName: scene.roomName,
          playerNumber: scene.playerNumber,
        });
      }
    }
  }

  playerMoved(player, scene) {
    const speed = 500;
    let playerMoved = false;
    player.body.setVelocityY(0);
    if (scene.cursors.up.isDown) {
      player.body.setVelocityY(-speed);
      playerMoved = true;
    } else if (scene.cursors.down.isDown) {
      player.body.setVelocityY(speed);
      playerMoved = true;
    }
    return playerMoved;
  }

  // GAME OBJECT CREATION
  createGameObjects(width, height, scene) {
    scene.initBackground(width, height, scene);
    scene.initBallObject(width, height, scene);
    scene.initPlayerObjects(width, height, scene);
    scene.initAnimation(width, height, scene);
    scene.initColliders(width, height, scene);
    scene.initScores(width, height, scene);
    scene.initObjectEventListeners(scene);
    scene.initUIButtons(width, height, scene);
  }

  initBackground(width, height, scene) {
    // Create middle line
    scene.middleLine = scene.add.graphics();
    scene.middleLine.lineStyle(0.5, 0xffb6c1);
    scene.middleLine.moveTo(width / 2, 0);
    scene.middleLine.lineTo(width / 2, height);
    scene.middleLine.stroke();
  }

  initBallObject(width, height, scene) {
    scene.ball = scene.physics.add.sprite(width / 2, height / 2, "ball");
    scene.ball.setCollideWorldBounds(true);
    scene.ball.setBounce(1, 1);
    //scene.ball.displayWidth = 50;
    scene.ball.scaleY = scene.ball.scaleX;
  }

  initAnimation(width, height, scene) {
    /*const x = Phaser.Math.RND.between(
      scene.playerOne.x + scene.playerOne.body.width,
      scene.playerTwo.x
    );
    const y = Phaser.Math.RND.between(50, height - 50);*/
    scene.fox = this.physics.add
      .sprite(
        this.physics.world.bounds.width / 2 - 20,
        this.physics.world.bounds.height / 2 - 50,
        //x,
        //y,
        "fox_wait"
      )
      .setScale(3)
      .refreshBody();

    scene.anims.create({
      key: "idle_fox",
      frames: this.anims.generateFrameNumbers("fox_wait", { start: 0, end: 4 }),
      frameRate: 5,
      repeat: -1,
    });
    scene.anims.create({
      key: "run_fox",
      frames: this.anims.generateFrameNumbers("fox_run", { start: 0, end: 4 }),
      frameRate: 8,
      repeat: -1,
    });
    scene.anims.create({
      key: "jump_fox",
      frames: this.anims.generateFrameNumbers("fox_jump", { start: 0, end: 4 }),
      frameRate: 11,
      repeat: -1,
    });

    scene.fox.anims.play("run_fox");
    scene.fox.setCollideWorldBounds(true);
    scene.fox.setImmovable(true);
  }

  initPlayerObjects(width, height, scene) {
    // Create and add PLAYER 1
    scene.playerOne = scene.physics.add.sprite(
      scene.ball.body.width / 2 + 1,
      height / 2,
      "paddle"
    );
    scene.playerOne.setCollideWorldBounds(true);
    scene.playerOne.setImmovable(true);
    scene.playerOne.setInteractive();
    scene.playerOne.displayWidth = 20;
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
    scene.playerTwo.displayWidth = 20;
    scene.playerTwo.scaleY = scene.playerTwo.scaleX;
  }

  initSprite(width, height, scene) {
    const x = Phaser.Math.RND.between(
      scene.playerOne.x + scene.playerOne.body.width,
      scene.playerTwo.x
    );
    const y = Phaser.Math.RND.between(50, height - 50);
    scene.star = this.add.sprite(x, y, "star");
  }

  initColliders(width, height, scene) {
    // Init collision between ball and paddles
    scene.physics.add.collider(scene.ball, scene.playerOne);
    /*scene.physics.add.collider(scene.ball, scene.playerOne, () => {
      if (scene.activeGame) {
        if (scene.ball.y < scene.playerOne.y) {
          scene.ball.body.velocity.y *= 1;
          if (scene.ball.body.velocity.y >= -100) {
            scene.ball.body.velocity.y = -100;
          }
        } else if (scene.ball.y > scene.playerOne.y) {;
          scene.ball.body.velocity.y *= -1;
          if (scene.ball.body.velocity.y >= 100) {
            scene.ball.body.velocity.y = 100;
          }
        }
      }
    });*/

    scene.physics.add.collider(scene.ball, scene.playerTwo);
    /*scene.physics.add.collider(scene.ball, scene.playerTwo, () => {
      if (scene.activeGame) {
        if (scene.ball.body.y < scene.playerTwo.body.y) {
          scene.ball.body.velocity.y *= 1;
          if (scene.ball.body.velocity.y >= -100) {
            scene.ball.body.velocity.y = -100;
          }
        } else if (scene.ball.body.y > scene.playerTwo.body.y) {
          scene.ball.body.velocity.y *= -1;
          if (scene.ball.body.velocity.y >= 100) {
            scene.ball.body.velocity.y = 100;
          }
        }
      }
    });*/

    scene.physics.add.collider(scene.ball, scene.fox, () => {
      if (scene.ball.body.velocity.x < 0) {
        if (scene.ball.body.velocity.x > -350) {
          scene.ball.body.velocity.x = -350;
        }
      } else {
        if (scene.ball.body.velocity.x < 350) {
          scene.ball.body.velocity.x = 350;
        }
      }
      if (scene.ball.body.velocity.y < 0) {
        if (scene.ball.body.velocity.y > -100) {
          scene.ball.body.velocity.y = -100;
        }
      } else {
        if (scene.ball.body.velocity.y < 100) {
          scene.ball.body.velocity.y = 100;
        }
      }

      if (scene.activeGame) {
        scene.playerOne.setScale(0.5);
        scene.playerTwo.setScale(0.5);
        scene.time.delayedCall(3000, function () {
          scene.playerOne.setScale(1);
          scene.playerTwo.setScale(1);
        });
      }
    });
  }

  initScores(width, heigth, scene) {
    // Init score player 1
    scene.playerOneScore = 0;
    scene.playerOneScoreText = scene.add
      .text(200, 50, scene.playerOneScore, { fontSize: "48px" })
      .setVisible(true)
      .setOrigin(0.5);
    //scene.playerOneScoreText.displayWidth = 0;
    scene.playerOneScoreText.scaleY = scene.playerOneScoreText.scaleX;

    // Init score player 2
    scene.playerTwoScore = 0;
    scene.playerTwoScoreText = scene.add
      .text(width - 200, 50, scene.playerTwoScore, { fontSize: "48px" })
      .setVisible(true)
      .setOrigin(0.5);
    //scene.playerTwoScoreText.displayWidth = 0;
    scene.playerTwoScoreText.scaleY = scene.playerTwoScoreText.scaleX;
  }

  initObjectEventListeners(scene) {
    // Init KEY EVENT listeners
    scene.cursors = scene.input.keyboard.createCursorKeys();

    // Init CLICK EVENT listeners
    scene.playerOne.on("pointerdown", scene.startDragPlayerOne, scene);
    scene.playerTwo.on("pointerdown", scene.startDragPlayerTwo, scene);
  }

  initUIButtons(width, height, scene) {
    scene.quitButton = scene.add.text(width / 2 - 60, height - 40, "QUIT", {
      fill: "#ffffff",
      fontSize: "20px",
      fontStyle: "bold",
    });
    scene.quitButton.setInteractive();
    scene.quitButton.on("pointerdown", () => {
      scene.socket.emit("quitGame");
    });

    scene.rematchButton = scene.add.text(
      width / 2 + 15,
      height - 40,
      "REMATCH",
      {
        fill: "#ffffff",
        fontSize: "20px",
        fontStyle: "bold",
      }
    );
    scene.rematchButton.setInteractive();
    scene.rematchButton.on("pointerdown", () => {
      if (scene.playerNumber === 3) return;
      if (scene.gameEnded) {
        scene.socket.emit("rematch", { roomName: scene.roomName });
      } else {
       // console.log("YOU NEED TO FINISH THE GAME BEFORE A REMATCH");
      }
    });
  }

  // CLICK EVENT LISTENER (DRAG) HELPERS
  startDragPlayerOne(pointer, targets) {
    this.input.off("pointerdown", this.startDragPlayerOne, this);
    this.input.on("pointermove", this.doDragPlayerOne, this);
    this.input.on("pointerup", this.stopDragPlayerOne, this);
  }

  startDragPlayerTwo(pointer, targets) {
    this.input.off("pointerdown", this.startDragPlayerTwo, this);
    this.input.on("pointermove", this.doDragPlayerTwo, this);
    this.input.on("pointerup", this.stopDragPlayerTwo, this);
  }

  doDragPlayerOne(pointer) {
    if (this.playerNumber === 1) {
      this.playerOne.y = pointer.y;
    }
  }
  doDragPlayerTwo(pointer) {
    if (this.playerNumber === 2) {
      this.playerTwo.y = pointer.y;
    }
  }

  stopDragPlayerOne(pointer, targets) {
    this.input.on("pointerdown", this.startDragPlayerOne, this);
    this.input.off("pointermove", this.doDragPlayerOne, this);
    this.input.off("pointerup", this.stopDragPlayerOne, this);
  }

  stopDragPlayerTwo(pointer, targets) {
    this.input.on("pointerdown", this.startDragPlayerTwo, this);
    this.input.off("pointermove", this.doDragPlayerTwo, this);
    this.input.off("pointerup", this.stopDragPlayerTwo, this);
  }
}
