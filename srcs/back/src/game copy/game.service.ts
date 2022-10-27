import { Injectable, Global } from '@nestjs/common';
import { Game } from './classes/game.class';
import { Socket, Server } from 'socket.io';
import { IoAdapter } from '@nestjs/platform-socket.io';
//import { FRAME_RATE, INITIAL_VELOCITY, CANVAS_WIDTH, DEFAULT_PADDLE_W, CANVAS_HEIGHT, DEFAULT_PADDLE_H } from './constants';
import { CANVAS_HEIGHT, CANVAS_WIDTH, DEFAULT_BALL_SPEED, DEFAULT_PADDLE_SPEED } from './constants';
import { Ball, Player } from "./classes";

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

    private waitingRoom3 = {
        level: 3,
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
    private privateRooms = {};

    handleConnection(client: Socket, server: Server) {
        this.players[client.id] = {
            id: client.id,
            socket: client,
            roomId: "",
            level: 0,
            spectator: false,
        }

    }

    handleNewGame(client: Socket, level: any, server: Server) {

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
            let roomId = this.makeid(5);
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

    handleCreateNewGame(client: Socket, data: any, server: Server) {
        let privateRoomId = this.makeid(5);
        this.players[client.id] = {
            id: client.id,
            socket: client,
            roomId: privateRoomId,
            level: data.level,
            spectator: false,
        }

        this.privateRooms[privateRoomId] = {
            playerOne: this.players[client.id],
            level: data.level
        }
        client.emit('createNewGame', { gameCode: privateRoomId });
    }

    handleJoinGame(client: Socket, data: any, server: Server) {

        this.players[client.id] = {
            id: client.id,
            socket: client,
            roomId: data.gameCode,
            level: 0,
            spectator: false,
        }

        if (this.privateRooms[data.gameCode]) {
            if (typeof this.activeGames[data.gameCode] !== 'undefined') {
                console.log("TWO PLAYERS ALREADY PLAYING"); // spectator watch game ou error ?
                this.players[client.id].spectator = true;
                this.handleWatchGame(client, data.gameCode, server);
                return;
            }
            this.players[client.id].level = this.privateRooms[data.gameCode].playerOne.level;
            this.privateRooms[data.gameCode].playerTwo = this.players[client.id];
            console.log(this.privateRooms[data.gameCode]);
            this.activeGames[data.gameCode] = {
                playerOne: this.privateRooms[data.gameCode].playerOne,
                playerTwo: this.players[client.id],
                level: this.players[client.id].level
            }
            Reflect.deleteProperty(this.privateRooms, data.gameCode);
            this.initGame(data.gameCode, server);
        }
    }


    initGame(roomId: any, server: Server) {

        let gameRoom = this.activeGames[roomId];
        console.log("GAME ROOM ", gameRoom);
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
        server.to(roomId).emit("newGame");

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

    randomNumberBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    setBallState(ball: Ball) {
        // IF DEFAULT GAME
        let dirx = 0;
        let diry = 0;
        while (Math.abs(dirx) <= 0.4 || Math.abs(dirx) >= 0.9) {
            const heading = this.randomNumberBetween(0, 2 * Math.PI);
            dirx = Math.cos(heading);
            diry = Math.sin(heading);
        }
        ball.initialVelocity.x = dirx * DEFAULT_BALL_SPEED;
        ball.initialVelocity.y = diry + DEFAULT_BALL_SPEED;
    }

    setPlayerState(players) {
        // if DEFAULT GAME
        players[0].speed = DEFAULT_PADDLE_SPEED;
        players[1].speed = DEFAULT_PADDLE_SPEED;

    }

    handleInitGame(client: Socket, gameCode: any, server: Server) {
        const state = this.activeGames[gameCode].state;

        if (this.players[client.id].spectator === true) {
            console.log("STATE SPECTATOR");
            console.log(state);

        }
        server.to(gameCode).emit("initGame", { state });
    }

    handleLaunchBall(client: Socket, gameCode: any, server: Server) {
        if (this.players[client.id].spectator === false && gameCode !== null) {
            const state = this.activeGames[gameCode].state;
            this.setBallState(state.ball);
            server.to(gameCode).emit("launchBall", { state });
        }
    }

    handleMoveBall(client: Socket, data: any, server: Server) {
        client.to(data.gameCode).emit("moveBall", { x: data.x, y: data.y });
    }

    makeid(length: number) {
        var result = "";
        var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    async handleWatchGame(client: Socket, gameCode: string, server: Server) {
        const room = gameCode;
        if (!this.activeGames[room]) {
            client.emit("unknownGame");
            return;
        } else {
            client.emit("init", { playerNumber: 3, gameCode: room });
            client.join(gameCode);
            this.players[client.id].roomId = room;
            this.players[client.id].spectator = true;
        }

    }

    async handleDisconnect(client: Socket, server: Server) {
        let roomId = this.players[client.id].roomId;
        let level = this.players[client.id].level;

        if (this.players[client.id].spectator === true) {
            console.log("spectator disconnected");
            client.emit('disconnected');
            client.leave(roomId);
            Reflect.deleteProperty(this.players, client.id);
            return;
        }

        if (this.privateRooms[roomId]) {
            Reflect.deleteProperty(this.privateRooms, roomId);
        } else {

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

            if (level !== 0) {
                if (waitingRoom.playerOne.id === client.id) {
                    waitingRoom.playerOne.id = waitingRoom.playerTwo.roomId;
                    waitingRoom.playerOne.socket = waitingRoom.playerTwo.socket;
                    waitingRoom.playerOne.roomId = waitingRoom.playerTwo.roomId;
                    waitingRoom.playerOne.level = waitingRoom.playerTwo.level;
                } else if (waitingRoom.playerTwo.id === client.id) {
                    waitingRoom.playerTwo.id = "";
                    waitingRoom.playerTwo.socket = "";
                    waitingRoom.playerTwo.roomId = "";
                    waitingRoom.playerOne.level = 0;
                }
            }
        }

        let allUsers;
        if (this.activeGames[roomId]) {
            allUsers = await server.in(roomId).fetchSockets();
            let sockets = [];
            allUsers.forEach(function (s) {
                s.emit('disconnected');
                s.leave(roomId);
                sockets.push(s.id);
            })
            console.log("CONNECTED " + sockets.length);
        }
        Reflect.deleteProperty(this.activeGames, roomId);
        Reflect.deleteProperty(this.players, client.id);
    }

    async handleQuitGame(client: Socket, data: any, server: Server) {

        let roomId = this.players[client.id].roomId;
        let level = this.players[client.id].level;

        if (data.playerNumber === 3) {
            client.leave(roomId);
            this.players[client.id].roomId = "";
            this.players[client.id].spectator = false;
            client.emit('quitGame', JSON.stringify("One spectator has left the game"));
            return;
        }

        if (this.privateRooms[roomId]) {
            Reflect.deleteProperty(this.privateRooms, roomId);
        } else {

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

            if (level !== 0) {
                if (waitingRoom.playerOne.id === client.id) {
                    waitingRoom.playerOne.id = waitingRoom.playerTwo.roomId;
                    waitingRoom.playerOne.socket = waitingRoom.playerTwo.socket;
                    waitingRoom.playerOne.roomId = waitingRoom.playerTwo.roomId;
                    waitingRoom.playerOne.level = waitingRoom.playerTwo.level;
                } else if (waitingRoom.playerTwo.id === client.id) {
                    waitingRoom.playerTwo.id = "";
                    waitingRoom.playerTwo.socket = "";
                    waitingRoom.playerTwo.roomId = "";
                    waitingRoom.playerOne.level = 0;
                }
            }
        }

        let allUsers;
        if (this.activeGames[roomId]) {
            allUsers = await server.in(roomId).fetchSockets();
            let sockets = [];
            allUsers.forEach(function (s) {
                s.emit('quitGame', JSON.stringify("One player has left the game"));
                s.leave(roomId);
                sockets.push(s.id);
            })
            Reflect.deleteProperty(this.activeGames, roomId);
        } else {
            client.emit('quitGame', JSON.stringify("Bye bye game..."));
        }
        this.players[client.id].roomId = "";
        this.players[client.id].level = 0;
        Reflect.deleteProperty(this.privateRooms, roomId);
    }

    handleMovePlayer(client: Socket, data: any, server: Server) {
        client.to(data.gameCode).emit("movePlayer", { playerNumber: data.playerNumber, y: data.y });
    }

    handleAddPoint(client: Socket, gameCode: any, player: number, server: Server) {
        if (this.players[client.id].spectator === false && gameCode !== null) {
            let score = ++this.activeGames[gameCode].state.players[player - 1].match_score;
            if (score === 11) {
                server.to(gameCode).emit('gameResult', { winner: player });
            } else {
                server.to(gameCode).emit('addPoint', { playerNumber: player, score });
            }
        }
    }

    handleGameResult(client: Socket, data: any, server: Server) {
        server.sockets.in(data.gameCode)
            .emit('gameResult', { winner: data.winner });
    }


}



