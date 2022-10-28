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
            //let roomId = this.codeGenerator(5);
            let roomId = "abcdef";
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
        client.to(data.roomName).emit('playerMoved', data)
    }

    handleLaunchBall(client: Socket, data: any, server: Server) {
        const state = this.activeGames[data.roomName].state;
        this.initBall(state.ball);
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
        ball.initialVelocity.x = dirx * 250;
        ball.initialVelocity.y = diry + 250;
    }

    randomNumberBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    handleMoveBall(client: Socket, data: any, server: Server) {
        client.to(data.roomName).emit("ballMoved", data);

    }

    handleAddPoint(client: Socket, data: any, server: Server) {
        let score = ++this.activeGames[data.roomName].state.players[data.player - 1].match_score;
        if (score === 3) {
            server.to(data.roomName).emit('gameResult', { winner: data.player });
        } else {
            server.to(data.roomName).emit('addPoint', { playerNumber: data.player, score });
        }
    }

    handleWatchGame(client: Socket, server: Server) {
        console.log("WATCH GANE");
        this.players[client.id].roomId = "abcdef"; // attention
        this.players[client.id].level = 0;
        this.players[client.id].spectator = true;
        if (this.activeGames["abcdef"]) {
            client.join("abcdef");
            client.emit("upDateInfo", this.activeGames["abcdef"].state);
        }   
    }

    async handleDisconnect(client: Socket, server: Server) {
        let roomName = this.players[client.id].roomId;
        let level = this.players[client.id].level;

        if (this.players[client.id].spectator) {
            console.log("spectator disconnected");
            client.emit("leftGame", {type: "disconnection"});
            Reflect.deleteProperty(this.players, client.id);
            return;
        }

        if (this.activeGames[roomName]) {
            let connSockets = await server.in(roomName).fetchSockets();
            connSockets.forEach((s) => {
                s.emit("leftGame", {type: "disconnection"});
                s.leave(roomName);
                this.players[s.id].level = 0;
                this.players[s.id].roomId = "";
            })
            Reflect.deleteProperty(this.activeGames, roomName);
            Reflect.deleteProperty(this.players, client.id);
        } else if (this.players[client.id].level !== 0) {
            let wr;
            if (this.players[client.id].level === 1) {
                wr = this.waitingRoom1;
            } else if (this.players[client.id].level === 2) {
                wr = this.waitingRoom2;
            }
            if (wr.playerOne.id === client.id) {
                this.switchPlayers(wr.playerOne, wr.plauerTwo, wr, 1);
            } else if (wr.playerTwo.id === client.id) {
                this.switchPlayers(null, null, wr, 2)
            }
        }

        Reflect.deleteProperty(this.players, client.id);
    }

    async handleQuitGame(client: Socket, server: Server) {
        console.log("1ACTIVE");
        console.log(this.activeGames);
        console.log("1PLAYERS");
        console.log(this.players);
        console.log("1WAITIN");
        console.log(this.waitingRoom1);

        let roomName = this.players[client.id].roomId;
        let level = this.players[client.id].level;

        if (this.players[client.id].spectator) {
            console.log("spectator left");
            let connSockets = await server.in("abcdef").fetchSockets();
            console.log("1USERS " + connSockets);
            this.players[client.id].roomId = "";
            this.players[client.id].spectator = false;
            client.leave("abcdef");
            client.emit("leftGame", {type: "quit"});
            console.log("2USERS " + connSockets);

            return;
        }

        if (this.activeGames[roomName]) {
            let connSockets = await server.in(roomName).fetchSockets();
            connSockets.forEach((s) => {
                s.emit("leftGame", {type: "quit"});
                s.leave(roomName);
                this.players[s.id].level = 0;
                this.players[s.id].roomId = "";
            })
            Reflect.deleteProperty(this.activeGames, roomName);
        } else if (this.players[client.id].level !== 0) {
            let wr;
            if (this.players[client.id].level === 1) {
                wr = this.waitingRoom1;
            } else if (this.players[client.id].level === 2) {
                wr = this.waitingRoom2;
            }
            if (wr.playerOne.id === client.id) {
                this.switchPlayers(wr.playerOne, wr.plauerTwo, wr, 1);
            } else if (wr.playerTwo.id === client.id) {
                this.switchPlayers(null, null, wr, 2)
            }
        }
        this.players[client.id].level = 0;
        this.players[client.id].roomId = "";
        this.players[client.id].spectator = false;


        console.log("1ACTIVE");
        console.log(this.activeGames);
        console.log("1PLAYERS");
        console.log(this.players);
        console.log("1WAITIN");
        console.log(this.waitingRoom1);
    }

    switchPlayers(playerOne, playerTwo, wr, n) {
        if (n === 1) {
            wr.playerOne.id = wr.playerTwo.id;
            wr.playerOne.socket = wr.playerTwo.socket;
            wr.playerOne.roomId = wr.playerTwo.roomId;
            wr.playerOne.level = wr.playerTwo.level;
        } else {
            wr.playerTwo.id = "";
            wr.playerTWo.socket = "";
            wr.playerTwo.roomId = "";
            wr.playerTwo.level = 0;
        }

    }

    handleRematch(client: Socket, data: any, server: Server) {
        server.to(data.roomName).emit("rematch");
    }

}



