import { Injectable, Global } from '@nestjs/common';
import { Game } from './classes/game.class';
import { Socket, Server } from 'socket.io';
import { IoAdapter } from '@nestjs/platform-socket.io';
//import { FRAME_RATE, INITIAL_VELOCITY, CANVAS_WIDTH, DEFAULT_PADDLE_W, CANVAS_HEIGHT, DEFAULT_PADDLE_H } from './constants';
import { CANVAS_HEIGHT, CANVAS_WIDTH, DEFAULT_BALL_SPEED, DEFAULT_PADDLE_SPEED } from './constants';
import { Ball, Player } from "./classes";


@Injectable()
export class GameService {
    private clientRooms = {};
    private state = {};

    private waitingRoomLevelOne = {
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
        }

    }

    async handleNewGame(client: Socket, server: Server) {
        let player = this.players[client.id];
        let waitingRoom = this.waitingRoomLevelOne;

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
                    playerTwo: waitingRoom.playerTwo
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
        playerOne.emit("init", { playerNumber: 1, gameCode: roomId });
        playerTwo.join(roomId);
        playerTwo.emit("init", { playerNumber: 2, gameCode: roomId });

        const state = this.createGameState();
        state.players[0].id = gameRoom.playerOne.id;
        state.players[1].id = gameRoom.playerTwo.id;
        state.roomName = roomId;
        this.setPlayerState(state.players);
        gameRoom.state = state;

        console.log(this.activeGames[roomId]);

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
        //players[0].speed = DEFAULT_PADDLE_SPEED;
        //players[1].speed = DEFAULT_PADDLE_SPEED;
        players[0].speed = 500;
        players[1].speed = 500;

    }

    handleInitGame(client: Socket, gameCode: any, server: Server) {
        console.log(this.activeGames[gameCode].playerOne);
        const state = this.activeGames[gameCode].state;
        //client.emit("initGame", {state});
        server.to(gameCode).emit("initGame", { state });

    }

    handleLaunchBall(client: Socket, gameCode: any, server: Server) {
        const state = this.activeGames[gameCode].state;
        this.setBallState(state.ball);
        //client.to(gameCode).emit("launchBall", {state});
        server.to(gameCode).emit("launchBall", { state });
    }

    handleMoveBall(client: Socket, data: any, server: Server) {
        client.to(data.gameCode).emit("moveBall", { x: data.x,y: data.y });
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

    async handleJoinGame(client: Socket, gameCode: string, server: Server) {
        // On parcours les rooms et on recupere celle dont le nom est gameCode
        const room = await server.sockets.adapter.rooms.has(gameCode);

        let allUsers;
        if (room) {
            allUsers = await server.in(gameCode).fetchSockets();
        }

        let numClients = 0;
        if (allUsers) {
            numClients = Object.keys(allUsers).length;
        }

        // Personne waiting to play game donc personne a join
        if (numClients === 0) {
            client.emit('unknownGame');
            return;
        } else if (numClients > 1) { // Trop de joueurs
            //client.emit('tooManyPlayers');
            client.join(gameCode);
            client.emit("init", { playerNumber: 3});
            return;
        }

        //this.clientRooms[client.id] = gameCode;

        //client.join(gameCode);
        //this.state[gameCode].players[1].id = client.id;
        ///client.emit('init', 2);
        //client.broadcast.emit('totalPlayers', 2);
        /*else if (numClients === 1) {
            client.emit('init', 2);
            this.clientRooms[client.id] = gameCode;
            this.state[gameCode].players[1].id = client.id;
            client.broadcast.emit('totalPlayers', 2);
        } else {
            //this.clientRooms[client.id] = gameCode;
            client.emit('init', 3);
        }
        client.join(gameCode);*/
    }

    async handleDisconnect(client: Socket, server: Server) {
        let roomId = this.players[client.id].roomId;
        let waitingRoom = this.waitingRoomLevelOne;

        if (waitingRoom.playerOne.id === client.id) {
            waitingRoom.playerOne.id = waitingRoom.playerTwo.roomId;
            waitingRoom.playerOne.socket = waitingRoom.playerTwo.socket;
            waitingRoom.playerOne.roomId = waitingRoom.playerTwo.roomId;
        } else if (waitingRoom.playerTwo.id === client.id) {
            waitingRoom.playerTwo.id = "";
            waitingRoom.playerTwo.socket = "";
            waitingRoom.playerTwo.roomId = "";
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
        }
        Reflect.deleteProperty(this.activeGames, roomId);
        Reflect.deleteProperty(this.players, client.id);
    }


    //handleReMatch(client: Socket, gameCode: any, server: Server) {
    //    server.sockets.in(gameCode).emit("reMatch", { text: "rematch !!" });
    //}

    async handleQuitGame(client: Socket, gameCode: any, server: Server) {
        let roomId2 = this.players[client.id].roomId;
        let waitingRoom = this.waitingRoomLevelOne;

        if (waitingRoom.playerOne.id === client.id) {
            waitingRoom.playerOne.id = waitingRoom.playerTwo.roomId;
            waitingRoom.playerOne.socket = waitingRoom.playerTwo.socket;
            waitingRoom.playerOne.roomId = waitingRoom.playerTwo.roomId;
        } else if (waitingRoom.playerTwo.id === client.id) {
            waitingRoom.playerTwo.id = "";
            waitingRoom.playerTwo.socket = "";
            waitingRoom.playerTwo.roomId = "";
        }
        
        let allUsers;
        if (this.activeGames[roomId2]) {
            allUsers = await server.in(roomId2).fetchSockets();
            let sockets = [];
            allUsers.forEach(function (s) {
                s.emit('quitGame', JSON.stringify("One player has left the game"));
                s.leave(roomId2);
                sockets.push(s.id);
            })
            Reflect.deleteProperty(this.activeGames, roomId2);
        } else {
            client.emit('quitGame', JSON.stringify("Bye bye game..."));
        }
        this.players[client.id].roomId = "";
    }

    handleMovePlayer(client: Socket, data: any, server: Server) {
        client.to(data.gameCode).emit("movePlayer", {playerNumber: data.playerNumber, x: data.x, y: data.y});
    }

    handleAddPoint(client: Socket, gameCode: any, player: number, server: Server) {
        ++this.activeGames[gameCode].state.players[player - 1].match_score;
        if (this.activeGames[gameCode].state.players[player - 1].match_score === 11) {
            server.to(gameCode).emit('gameResult', { winner: player });
        } else {
            server.to(gameCode).emit('addPoint', { playerNumber: player });
        }
    }

    handleGameResult(client: Socket, data: any, server: Server) {
        server.sockets.in(data.gameCode)
            .emit('gameResult', { winner: data.winner });
    }


}



