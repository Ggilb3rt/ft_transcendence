import Phaser, { Scene } from "phaser";
import io from "socket.io-client";

import eventsCenter from "./EventsCenter";

import ballImage from "../assets/ball.png";
import paddleImage from "@/assets/game/paddle2.png";
import middleLine from "@/assets/game/middleLine.png";

export default class LevelOneScene extends Phaser.Scene {
    constructor() {
        super("LevelOneScene");
        this.playerNumber;
        this.activeGame = false;
        this.matchEnded = false;
        this.state = {};
        //this.vendingMachineStatus = false;
    }

    init(data) {
        this.spectator = data.spectator;
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


        /* INIT SOCKET */
        scene.socket = io("http://localhost:3000/game");

        if (!scene.spectator) {
            scene.scene.launch("WaitingRoom", { socket: scene.socket, playerNumber: scene.playerNumber });
        }


        /* ADD GAME OBJECTS */
        scene.createGameObjects(width, height, scene);


        /* EVENT LISTENERS */

        // When a socket arrives to this scene, it joins a queue to wait for a second player
        if (!scene.spectator) {
            scene.socket.emit("joinQueue", { level: 1 });
        } else {
            scene.socket.emit("watchGame");
            scene.socket.on("upDateInfo", (data) => {
                scene.playerNumber = 3;
                scene.roomId = data.roomName;
                scene.playerOneScoreText.setText(data.players[0].match_score);
                scene.playerTwoScoreText.setText(data.players[1].match_score);
            })
        }

        // When two sockets are connected, a room is created. The first one on the queue will
        // become playerOne and the second one playerTwo. The room is given a roomName
        scene.socket.on("init", (data) => {
            console.log(data.playerNumber);
            scene.playerNumber = data.playerNumber;
            scene.roomName = data.gameCode;
        });

        // When giving specific info to each player is done, we can start the game 
        scene.socket.on("roomComplete", (state) => {
            eventsCenter.emit("ready");
            scene.state = state;
            scene.time.delayedCall(3000, function () {
                scene.startGame(scene);
            })

        });

        scene.socket.on("launchBall", (data) => {
            if (scene.playerNumber === 1) {
                scene.launchBall(data, scene);
            }
        })

        scene.socket.on("ballMoved", (data) => {
            if (scene.playerNumber !== 1) {
                scene.ball.x = data.x + scene.ball.body.width / 2 + 2;
                scene.ball.y = data.y + scene.ball.body.height / 2 + 2;
            }
        })

        // When a player moves, we change its position here ONLY for the opponent 
        scene.socket.on("playerMoved", (data) => {
            const { y, roomName, playerNumber } = data;
            if (playerNumber === 1 && playerNumber !== scene.playerNumber) {
                console.log("actualise");
                scene.playerOne.y = y;
            } else if (playerNumber === 2 && playerNumber !== scene.playerNumber) {
                console.log("actualise");
                scene.playerTwo.y = y;
            }
        });

        scene.socket.on("addPoint", (data) => {
            console.log("ADDING POINT");
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

            scene.time.delayedCall(1000, function () {
                scene.activeGame = true;
                if (scene.playerNumber === 1) {
                    scene.socket.emit("launchBall", { roomName: scene.roomName })
                }
            })
        })

        scene.socket.on("gameResult", (data) => {
            scene.resultText = scene.add.text(
                width / 2,
                height / 2,
                "PLAYER " + data.winner + " WINS !",
                { fontSize: "36px" }).setVisible(true);
            scene.gameEnded = true;
        })

        scene.socket.on("leftGame", (type) => {
            if (type === "disconnection") {
                console.log("a player disconnected");
                scene.scene.start("MenuScene");
            } else if (type === "quit") {
                console.log("a player quit");
            }
            scene.scene.start("MenuScene");
        })

        scene.socket.on("rematch", (type) => {
            console.log("REMATCH");
            scene.scene.restart();
        })
    }

    update() {
        const scene = this;

        if (scene.activeGame) {
            scene.moveBall(scene);
            scene.checkPlayerMovement(scene);
            scene.checkPoints(scene);
        }
    }

    startGame(scene) {
        console.log("NOW");
        scene.activeGame = true;
        if (scene.playerNumber === 1) {
            scene.socket.emit("launchBall", { roomName: scene.roomName })
        }
        //props.socket.emit("launchBall", { gameCode: props.gameCode });
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
                y: scene.ball.body.y
            })
        }
    }

    checkPoints(scene) {
        if (scene.playerNumber === 1) {
            if (scene.ball.body.x < scene.playerOne.body.x /*+ scene.playerOne.body.width*/) {
                console.log("point for 2");
                scene.activeGame = false;
                scene.ball.setVelocity(0);
                //scene.ball.setImmovable();
                scene.socket.emit("addPoint", { roomName: scene.roomName, player: 2 });
            }
            if (scene.ball.x > scene.playerTwo.body.x /*+ scene.playerTwo.body.width*/) {
                console.log("point for 2");
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
            if (scene.playerMoved(scene.playerOne, scene)) {
                console.log("moved " + scene.playerNumber);
                scene.socket.emit("playerMovement", {
                    y: scene.playerOne.y,
                    roomName: scene.roomName,
                    playerNumber: scene.playerNumber
                });
            }
        } else if (scene.playerNumber === 2) {
            if (scene.playerMoved(scene.playerTwo, scene)) {
                console.log("moved " + scene.playerNumber);
                scene.socket.emit("playerMovement", {
                    y: scene.playerTwo.y,
                    roomName: scene.roomName,
                    playerNumber: scene.playerNumber
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
        scene.initColliders(scene);
        scene.initScores(width, height, scene);
        scene.initObjectEventListeners(scene);
        scene.initUIButtons(width, height, scene);
    }






    initBackground(width, height, scene) {

        // Create middle line
        scene.middleLine = scene.add.graphics();
        scene.middleLine.lineStyle(1, 0xffffff);
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
        scene.playerOne.displayWidth = 10;
        //scene.playerOne.setScale(0.5);
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
    }

    initColliders(scene) {

        // Init collision between ball and paddles
        scene.physics.add.collider(scene.ball, scene.playerOne);
        scene.physics.add.collider(scene.ball, scene.playerTwo);
    }


    initScores(width, heigth, scene) {

        // Init score player 1
        scene.playerOneScore = 0;
        scene.playerOneScoreText = scene.add.text(
            200,
            50,
            scene.playerOneScore,
            { fontSize: "48px" }
        ).setVisible(true).setOrigin(0.5)
        //scene.playerOneScoreText.displayWidth = 0;
        scene.playerOneScoreText.scaleY = scene.playerOneScoreText.scaleX;

        // Init score player 2
        scene.playerTwoScore = 0;
        scene.playerTwoScoreText = scene.add.text(
            width - 200,
            50,
            scene.playerTwoScore,
            { fontSize: "48px" }
        ).setVisible(true).setOrigin(0.5)
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
            console.log("quit button clicked");
            scene.socket.emit("quitGame");
        });

        scene.rematchButton = scene.add.text(width / 2 + 15, height - 40, "REMATCH", {
            fill: "#ffffff",
            fontSize: "20px",
            fontStyle: "bold",
        });
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
