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
    private intervalId;

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

    initGame() {
        const state = this.createGameState();
        this.setPlayerState(state.players);
        return state;
    }

    reInitGameState(state) {
        
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
        ball.initialVelocity.x = dirx * DEFAULT_PADDLE_SPEED;
        ball.initialVelocity.y = diry + DEFAULT_PADDLE_SPEED;

    }

    setPlayerState(players) {
        // if DEFAULT GAME
        players[0].speed = DEFAULT_PADDLE_SPEED;
        players[1].speed = DEFAULT_PADDLE_SPEED;

    } 

    handleInitGame(client: Socket, gameCode: any, server: Server) {
        const state = this.state[gameCode];
        server.sockets.in(gameCode).emit('initGame', {state});

    }

    handleLaunchBall(client: Socket, gameCode: any, server: Server) {
        const state = this.state[gameCode];
        this.setBallState(state.ball);
        client.emit('launchBall', {state} );
    }

    handleMoveBall(client: Socket, data: any, server: Server) {
        client.broadcast.emit('moveBall', {x: data.x, y: data.y});
    }

    handleNewGame(client: Socket, server: Server) {
        let roomName = this.makeid(5);
        this.clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);

        this.state[roomName] = this.initGame();
        this.state[roomName].roomName = roomName;

        client.join(roomName);
        this.state[roomName].players[0].id = client.id;
        client.emit('init', 1);
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
            return;
        }

        this.clientRooms[client.id] = gameCode;

        client.join(gameCode);
        this.state[gameCode].players[1].id = client.id;
        client.emit('init', 2);
        client.broadcast.emit('totalPlayers', 2);
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

        clearInterval(this.intervalId);
        const roomName = this.clientRooms[client.id];

        let allUsers;
        if (roomName) {
            allUsers = await server.in(roomName).fetchSockets();
            let sockets = [];
            allUsers.forEach(function (s) {
                s.emit('disconnected');
                s.leave(roomName);
                sockets.push(s.id);
            });
            sockets.forEach(socket => Reflect.deleteProperty(this.clientRooms, socket));
        }

        Reflect.deleteProperty(this.clientRooms, client.id);
    }

    handleReMatch(client: Socket, gameCode: any, server: Server) {
        server.sockets.in(gameCode).emit("reMatch", {text: "rematch !!"});
    }

    async handleQuitGame(client: Socket, gameCode: any, server: Server) {
        clearInterval(this.intervalId);
        const roomName = this.clientRooms[client.id];

        let allUsers;
        if (roomName) {
            allUsers = await server.in(roomName).fetchSockets();
            let sockets = [];
            allUsers.forEach(function (s) {
                s.emit('quitGame', JSON.stringify("Bye bye game..."));
                s.leave(roomName);
                sockets.push(s.id);
            });
            sockets.forEach(socket => Reflect.deleteProperty(this.clientRooms, socket));
            Reflect.deleteProperty(this.clientRooms, client.id);
        } else {
            client.emit('quitGame', JSON.stringify("One player has left the game"));
        }
    }

    handleMovePlayer(client: Socket, pos: any, server: Server) {
        client.broadcast.emit("movePlayer", pos);
    }

    handleAddPoint(client: Socket, gameCode: any, player: number, server: Server) {
        ++this.state[gameCode].players[player - 1].match_score;
        if (this.state[gameCode].players[player - 1].match_score === 11) {
                server.sockets.in(gameCode).emit('gameResult', { winner: player });
        } else {
            server.sockets.in(gameCode).emit('addPoint', {playerNumber: player});
        }
    }

    handleGameResult(client: Socket, data: any, server: Server) {
        server.sockets.in(data.gameCode)
            .emit('gameResult', { winner: data.winner });
    }

   
}


 
