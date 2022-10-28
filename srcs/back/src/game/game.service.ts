import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Ball, Player } from './classes';
import { DEFAULT_PADDLE_SPEED } from './constants';
 
@Injectable()
export class GameService {
    private waitingRoom1 = {
        level: 1,
        status: "empty",
        playerOne: {
            id: "",
            socket: "",
            roomId: "",
        },
        playerTwo: {
            id: "",
            socket: "",
            roomId: ""
        },
        roomId: "",
    };

    private waitingRoom2 = {
        level: 2,
        status: "empty",
        playerOne: {
            id: "",
            socket: "",
            roomId: "",
        },
        playerTwo: {
            id: "",
            socket: "",
            roomId: ""
        },
        roomId: "",
    };

    private activeGames = {};
    private players = {};

    handleConnection(client: Socket, server: Server) {
        this.players[client.id] = {
            id: client.id,
            socket: client,
            roomId: "",
            level: 0,
            spectator: false,
        }
    }

    handleJoinQueue(client: Socket, data: any, server: Server) { 
        let level = data.level;
        let player = this.players[client.id];
        this.players[client.id].level = level;
        let waitingRoom;
        if (level === 1) {
            console.log("level1");
            waitingRoom = this.waitingRoom1;
        } else if (level === 2) {
            console.log("level2");
            waitingRoom = this.waitingRoom2;
        } else if (level === 3) {
            console.log("level3");
            waitingRoom = this.waitingRoom2;
        }

        // Waiting room is empty
        if (waitingRoom.playerOne.id === "" && waitingRoom.playerTwo.id === "") {
            console.log("room empty");
            let roomId = this.codeGenerator(5);
            waitingRoom.roomId = roomId;
            waitingRoom.playerOne.id = player.id;
            waitingRoom.playerOne.socket = player.socket;
            waitingRoom.playerOne.roomId = roomId;
            this.players[player.id].roomId = waitingRoom.roomId;
        }
        // Waiting room has 1 player
        else if (waitingRoom.playerOne.id !== "" && waitingRoom.playerTwo.id === "") {
            console.log("room waiting");
            waitingRoom.playerTwo.id = player.id;
            waitingRoom.playerTwo.socket = player.socket;
            waitingRoom.playerTwo.roomId = waitingRoom.roomId;
            this.players[player.id].roomId = waitingRoom.roomId;
            // Waiting room has 2 players
            if (waitingRoom.playerOne.id !== "" && waitingRoom.playerTwo.id !== "") {
                console.log("room complete");
                this.activeGames[waitingRoom.roomId] = {
                    playerOne: waitingRoom.playerOne,
                    playerTwo: waitingRoom.playerTwo,
                    level: waitingRoom.level,
                }

                this.initGame(waitingRoom.roomId, server);

                // Reset waiting Rooms
                waitingRoom.playerOne.id = "";
                waitingRoom.playerOne.socket = "";
                waitingRoom.playerOne.roomId = "";
                waitingRoom.playerTwo.id = "";
                waitingRoom.playerTwo.socket = "";
                waitingRoom.playerTwo.roomId = "";
            }
        }

    }

    initGame(roomId: any, server: Server) {
        let gameRoom = this.activeGames[roomId];
        let playerOne = gameRoom.playerOne.socket;
        let playerTwo = gameRoom.playerTwo.socket;

        playerOne.join(roomId);
        playerOne.emit("init", { playerNumber: 1, gameCode: roomId, level: gameRoom.level });
        playerTwo.join(roomId);
        playerTwo.emit("init", { playerNumber: 2, gameCode: roomId, level: gameRoom.level });

        const state = this.createGameState();
        state.players[0].id = gameRoom.playerOne.id;
        state.players[1].id = gameRoom.playerTwo.id;
        state.roomName = roomId;
        this.setPlayerState(state.players);
        gameRoom.state = state;
        server.to(roomId).emit("roomComplete", state);

    }

    createGameState() {
        return {
            ball: new Ball,
            players: [
                new Player,
                new Player,
            ],
            roomName: String
        }
    }

    setPlayerState(players) {
        // if DEFAULT GAME
        players[0].speed = DEFAULT_PADDLE_SPEED;
        players[1].speed = DEFAULT_PADDLE_SPEED;

    }

    codeGenerator(length: number) {
        var result = "";
        var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    handlePlayerMovement(client: Socket, data: any, server: Server) {
        console.log(data);
        console.log(data.roomName)
        client.to(data.roomName).emit('playerMoved', data)
    }

    handleLaunchBall(client: Socket, data: any, server: Server){
        const state = this.activeGames[data.roomName].state;
        this.initBall(state.ball);
        console.log(state);
        server.to(data.roomName).emit("launchBall", state);
    }

    initBall(ball: Ball) {
        let dirx = 0;
        let diry = 0;
        while (Math.abs(dirx) <= 0.4 || Math.abs(dirx) >= 0.9) {
            const heading = this.randomNumberBetween(0, 2 * Math.PI);
            dirx = Math.cos(heading);
            diry = Math.sin(heading);
        }
        //ball.initialVelocity.x = dirx * DEFAULT_BALL_SPEED;
        //ball.initialVelocity.y = diry + DEFAULT_BALL_SPEED;
        ball.initialVelocity.x = dirx * 500;
        ball.initialVelocity.y = diry + 500;
    }

    randomNumberBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    handleMoveBall(client: Socket, data: any, server: Server){
        client.to(data.roomName).emit("ballMoved", data);

    }
}


