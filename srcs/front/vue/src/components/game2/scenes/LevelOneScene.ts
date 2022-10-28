import Phaser, { Scene } from "phaser";
import io from "socket.io-client";

import ballImage from "@/assets/game/ball.png";
import paddleImage from "@/assets/game/paddle2.png";
import middleLine from "@/assets/game/middleLine.png";

export default class LevelOneScene extends Phaser.Scene {
    constructor() {
        super("LevelOneScene");
        this.playerNumber;
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


        /* INIT SOCKET */
        this.socket = io("http://localhost:3000/game");

        /* ADD GAME OBJECTS */
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

        /* EVENT LISTENERS */

        // When a socket arrives to this scene, it joins a queue to wait for a second player
        scene.socket.emit("joinQueue", { level: 1 });

        // When two sockets are connected, a room is created. The first one on the queue will
        // become playerOne and the second one playerTwo. The room is given a roomName
        scene.socket.on("init", (data) => {
            console.log(data.playerNumber);
            scene.playerNumber = data.playerNumber;
            scene.roomName = data.gameCode;
        });

        // When giving specific info to each player is done, we can start the game 
        scene.socket.on("roomComplete", (state) => {
            console.log("STATE");
            console.log(state);
            scene.state = state;
            scene.waitingText.setVisible(false);
            scene.readyText = scene.add.text(
                140,
                215,
                "LEVEL ONE SCENE... ROOM COMPLETE. GAME ABOUT TO START...",
                {
                    fill: "#ffffff",
                    fontSize: "20px",
                    fontStyle: "bold",
                }
            );
            scene.time.delayedCall(3000, function () {
                scene.readyText.setVisible(false);
            scene.startGame(scene);
            })
            //const timestamp = Date.now();
            //while (Date.now() <= timestamp + 3000);
            //scene.readyText.setVisible(false);
            //scene.startGame(scene);
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
    }

    update() {
        const scene = this;

        scene.moveBall(scene);
        scene.checkPlayerMovement(scene);
        

    }

    startGame(scene) {
        console.log("NOW");
        if (scene.playerNumber === 1) {
            scene.socket.emit("launchBall", { roomName: scene.roomName})
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
        const speed = 225;
        let playerMoved = false;
        player.body.setVelocityY(0);
        if (scene.cursors.up.isDown) {
            player.body.setVelocityY(-speed);
            playerMoved = true;
        } else if (scene.cursors.down.isDown) {
            player.body.setVelocityY(speed);
            playerMoved = true;
        }

        /*if (scene.ball.body.velocity.y > speed) {
            scene.ball.body.velocity.y = scene.paddleSpeed;
        } else if (scene.ball.body.velocity.y < -speed) {
            scene.ball.body.velocity.y = -speed;
        }*/

        return playerMoved;
    }

    // GAME OBJECT CREATION
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
        scene.playerOne.on("pointerdown", scene.startDragPlayerOne, scene);
        scene.playerTwo.on("pointerdown", scene.startDragPlayerTwo, scene);
    }

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
