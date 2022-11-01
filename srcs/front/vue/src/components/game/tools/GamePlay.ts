import { Socket } from "socket.io-client";
import eventsCenter from "../scenes/EventsCenter";

export default class GamePlay {
  constructor() {
    const self = this;
  }

  joinQueue(scene, level) {
      scene.socket.emit("joinQueue", { level });
  }

  watchGame(scene) {
    scene.socket.emit("watchGame");
    scene.socket.on("upDateInfo", (data) => {
      scene.playerNumber = 3;
      scene.roomName = data.roomName;
      scene.playerOneScoreText.setText(data.players[0].match_score);
      scene.playerTwoScoreText.setText(data.players[1].match_score);
    });

  }

  addEventListeners(width, height, scene) {
    this.listenInitPlayer(scene);
    this.listenInitGame(scene);
    this.listenInitBallMovement(scene);
    this.listenBallMoved(width, height, scene);
    this.listenPlayerMoved(width, height, scene);
    this.listenAddPoint(width, height, scene);
    this.listenGameResult(width, height, scene);
    this.listenLeftGame(width, height, scene);
    this.listenRematch(scene);
  }

  /* Une fois que deux joueurs sont present dans une meme room, le premier dans la queue
      sera initialise en tant que playerOne, le deuxieme en tant que playerTwo */
  listenInitPlayer(scene) {
    scene.socket.on("init", (data) => {
      scene.playerNumber = data.playerNumber;
      scene.roomName = data.gameCode;
    });
  }

  /* Une fois que les deux joueurs ont ete initialises, on lance le jeu */
  listenInitGame(scene) {
    scene.socket.on("roomComplete", (state) => {
      eventsCenter.emit("ready");
      scene.time.delayedCall(3000, () => {
        this.startGame(scene);
      });
    });
  }

  /* A chaque debut de partie ou apres chaque point, on relance la balle */
  listenInitBallMovement(scene) {
    scene.socket.on("launchBall", (data) => {
      if (scene.playerNumber === 1) {
        this.launchBall(data, scene);
      }
    });
  }

  /* On update la position de la balle du playerTwo afin de s'assurer que la position soit synchro */
  listenBallMoved(width, height, scene) {
    scene.socket.on("ballMoved", (data) => {
      if (scene.playerNumber !== 1) {
        scene.ball.x = data.x + scene.ball.body.width / 2 + 2;
        scene.ball.y = data.y + scene.ball.body.height / 2 + 2;
      }
    });
  }
  /* On update la position de l'autre joueur afin de synchroniser */
  listenPlayerMoved(width, height, scene) {
    scene.socket.on("playerMoved", (data) => {
      const { y, roomName, playerNumber } = data;
      if (playerNumber === 1 && playerNumber !== scene.playerNumber) {
        scene.playerOne.y = y;
      } else if (playerNumber === 2 && playerNumber !== scene.playerNumber) {
        scene.playerTwo.y = y;
      }
    });
  }
  /* A chaque point on update le score pour l'autre joueur et on reset la position de la balle */
  listenAddPoint(width, height, scene) {
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
      scene.p1oldposy = scene.playerOne.y;
      scene.p1oldposy = scene.playerTwo.y;

      scene.time.delayedCall(1000, function () {
        scene.activeGame = true;
        if (scene.playerNumber === 1) {
          scene.socket.emit("launchBall", { roomName: scene.roomName });
        }
      });
    });
  }

  /* On previent les deux joueurs s'il y a un gagnant */
  listenGameResult(width, height, scene) {
    scene.socket.on("gameResult", (data) => {
      scene.resultText = scene.add
        .text(width / 2, height / 2, "PLAYER " + data.winner + " WINS !", {
          fontSize: "36px",
        })
        .setVisible(true);
      scene.gameEnded = true;
    });
  }

  /* On previent le joueur si l'opponent a quitte la partie */
  listenLeftGame(width, height, scene) {
    scene.socket.on("leftGame", (type) => {
      console.log(type);
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
  }

  listenRematch(scene) {
    scene.socket.on("rematch", (type) => {
      console.log("REMATCH");
      scene.scene.restart();
    });
  }

  startGame(scene) {
    console.log("NOW");
    scene.activeGame = true;
    if (scene.playerNumber === 1) {
      scene.socket.emit("launchBall", { roomName: scene.roomName });
    }
  }

  launchBall(data, scene) {
    scene.ball.setVelocityX(data.ball.initialVelocity.x);
    scene.ball.setVelocityY(data.ball.initialVelocity.y);
  }

  moveBall(scene) {
    if (scene.playerNumber === 1) {
      scene.socket.emit("moveBall", {
        roomName: scene.roomName,
        x: scene.ball.body.x,
        y: scene.ball.body.y,
      });
    }
  }

  checkPoints(scene) {
    if (scene.playerNumber === 1) {
      if (
        scene.ball.body.x <
        scene.playerOne.body.x /*+ scene.playerOne.body.width*/
      ) {
        scene.activeGame = false;
        scene.ball.setVelocity(0);
        //scene.ball.setImmovable();
        scene.socket.emit("addPoint", { roomName: scene.roomName, player: 2 });
      }
      if (
        scene.ball.x > scene.playerTwo.body.x /*+ scene.playerTwo.body.width*/
      ) {
        scene.activeGame = false;
        scene.ball.setVelocity(0);
        //scene.ball.setImmovable();
        scene.socket.emit("addPoint", { roomName: scene.roomName, player: 1 });
      }
    }
  }

  /* HELPER FUNCTIONS */

  // PLAYER MOVEMENT
  checkPlayerMovement(scene) {
    if (scene.playerNumber === 1) {
      if (
        this.playerMoved(scene.playerOne, scene) ||
        scene.p1oldposy != scene.playerOne.y
      ) {
        console.log("moved " + scene.playerNumber);
        scene.socket.emit("playerMovement", {
          y: scene.playerOne.y,
          roomName: scene.roomName,
          playerNumber: scene.playerNumber,
        });
        scene.p1oldposy = scene.playerOne.y;
      }
    } else if (scene.playerNumber === 2) {
      if (
        this.playerMoved(scene.playerTwo, scene) ||
        scene.p2oldposy != scene.playerTwo.y
      ) {
        console.log("moved " + scene.playerNumber);
        scene.socket.emit("playerMovement", {
          y: scene.playerTwo.y,
          roomName: scene.roomName,
          playerNumber: scene.playerNumber,
        });
        scene.p1oldposy = scene.playerTwo.y;
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
  createGameObjects(level, settings, images, width, height, scene) {
    this.initBackground(width, height, scene);
    this.initBallObject(level, settings, images, width, height, scene);
    this.initPlayerObjects(level, settings, images, width, height, scene);
    this.initColliders(scene);
    this.initScores(width, height, scene);
    this.initObjectEventListeners(scene);
    this.initUIButtons(width, height, scene);
  }

  initBackground(width, height, scene) {
    // Create middle line
    scene.middleLine = scene.add.graphics();
    scene.middleLine.lineStyle(1, 0xffffff);
    scene.middleLine.moveTo(width / 2, 0);
    scene.middleLine.lineTo(width / 2, height);
    scene.middleLine.stroke();
  }

  initBallObject(level, settings, images, width, height, scene) {
    if (level === 1 || level == 2) {
      scene.ball = scene.physics.add.sprite(width / 2, height / 2, images.ball);
    }
    if (level === 2) {
      switch (settings.ball) {
        case "WHITE":
          break;
        case "BLUE":
          scene.ball.tint = 0x0080ff;
          break;
        case "GREEN":
          scene.ball.tint = 0x008000;
          break;
        case "ORANGE":
          scene.ball.tint = 0xffa500;
          break;
        case "YELLOW":
          scene.ball.tint = 0xffff00;
      }
    }
    scene.ball.setCollideWorldBounds(true);
    scene.ball.setBounce(1, 1);
    scene.ball.scaleY = scene.ball.scaleX;
  }

  initPlayerObjects(level, settings, images, width, height, scene) {
      if (level === 1 || level === 2) {
        console.log(level);
      scene.playerOne = scene.physics.add.sprite(
        scene.ball.body.width / 2 + 1,
        height / 2,
        images.playerOne
      );
      scene.playerTwo = scene.physics.add.sprite(
        width - (scene.ball.body.width / 2 + 1),
        height / 2,
        images.playerTwo
      );
    }
    if (level === 2) {
      switch (settings.playerOne) {
        case "WHITE":
          break;
        case "BLUE":
          scene.playerOne.tint = 0x0080ff;
          break;
        case "GREEN":
          scene.playerOne.tint = 0x008000;
          break;
        case "ORANGE":
          scene.playerOne.tint = 0xffa500;
          break;
        case "YELLOW":
          scene.playerOne.tint = 0xffff00;
      }
      switch (settings.playerTwo) {
        case "WHITE":
          break;
        case "BLUE":
          scene.playerTwo.tint = 0x0080ff;
          break;
        case "GREEN":
          scene.playerTwo.tint = 0x008000;
          break;
        case "ORANGE":
          scene.playerTwo.tint = 0xffa500;
          break;
        case "YELLOW":
          scene.playerTwo.tint = 0xffff00;
      }
    }

    scene.playerOne.setCollideWorldBounds(true);
    scene.playerOne.setImmovable(true);
    scene.playerOne.setInteractive();
    scene.playerOne.displayWidth = 10;
    scene.playerOne.scaleY = scene.playerOne.scaleX;
    scene.p1oldposy = scene.playerOne.y;

    scene.playerTwo.setCollideWorldBounds(true);
    scene.playerTwo.setImmovable(true);
    scene.playerTwo.setInteractive();
    scene.playerTwo.displayWidth = 10;
    scene.playerTwo.scaleY = scene.playerTwo.scaleX;
    scene.p2oldposy = scene.playerTwo.y;
  }

  initColliders(scene) {
    // Init collision between ball and paddles
    scene.physics.add.collider(scene.ball, scene.playerOne);
    scene.physics.add.collider(scene.ball, scene.playerTwo);
  }

  initScores(width, heigth, scene) {
    // Init score player 1
    scene.playerOneScore = 0;
    scene.playerOneScoreText = scene.add
      .text(200, 50, scene.playerOneScore, { fontSize: "48px" })
      .setVisible(true)
      .setOrigin(0.5);
    scene.playerOneScoreText.scaleY = scene.playerOneScoreText.scaleX;

    // Init score player 2
    scene.playerTwoScore = 0;
    scene.playerTwoScoreText = scene.add
      .text(width - 200, 50, scene.playerTwoScore, { fontSize: "48px" })
      .setVisible(true)
      .setOrigin(0.5);
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
      console.log("quit button clicked");
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
        console.log("YOU NEED TO FINISH THE GAME BEFORE A REMATCH");
      }
    });
  }

  // CLICK EVENT LISTENER (DRAG) HELPERS
  /*startDragPlayerOne(pointer, targets) {
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
    }*/
}
