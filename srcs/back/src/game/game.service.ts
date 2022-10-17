import { Injectable, Global } from '@nestjs/common';
import { Game } from './classes/game.class';
import { Socket, Server } from 'socket.io';
import { IoAdapter } from '@nestjs/platform-socket.io';
//import { FRAME_RATE, INITIAL_VELOCITY, CANVAS_WIDTH, DEFAULT_PADDLE_W, CANVAS_HEIGHT, DEFAULT_PADDLE_H } from './constants';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants';
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
        this.setPlayerPos(state.ball, state.players);
        //this.randomDir(state.ball);
        return state;
    }

    reInitGameState(state) {

    }

    setPlayerPos(ball: Ball, players: Player[]) {
       /* let playerOne = players[0];
        playerOne.posx = 0;

        let playerTwo = players[1];
        playerTwo.posx = CANVAS_WIDTH - playerTwo.width;*/

        let playerOne = players[0];
        playerOne.x = 1;

        let playerTwo = players[1];
        playerTwo.x = CANVAS_WIDTH - 1;
    }


    emitGameState(roomName: string, state: any, server: Server) {
        server.sockets.in(roomName)
            .emit('gameState', JSON.stringify(state));
    }

    emitGameOver(roomName: string, winner, state: any, server: Server) {
        server.sockets.in(roomName)
            .emit('gameOver', JSON.stringify({ winner, state}));
    }

    handleMoveBall(client: Socket, data: any, server: Server) {
        client.broadcast.emit('moveBall', {x: data.x, y: data.y});
        //server.sockets.in(data.gameCode).emit('ballMovement', {x: posx, y: posy});
    }

    /*gameLoop(state) {
        if (!state) {
            return;
        }

        let ball = state.ball;
        this.ballMovement(ball);
        this.wallCollision(ball);

        let players = state.players;
        this.paddleMovement(players)
        this.paddleCollision(ball, players);

        if ((ball.posx + (ball.rad * 2)) <= 0) {
            ++state.players[0].match_score;
            if (state.players[0].match_score === 1) {
                let result = {
                    playerOne: state.players[0].match_score,
                    playerTwo: state.players[1].match_score,
                    winner: 2
                }
                state.players[0].game_scores.push(result);
                state.players[1].game_scores.push(result);
                console.log(state.players[0].game_scores);
                return (2); // Player 1 wins
            }
            this.reInitGameState(state);

        } else if ((ball.posx - (ball.rad * 2)) >= CANVAS_WIDTH) {
            ++state.players[1].match_score;
            if (state.players[1].match_score === 1) {
                let result = {
                    playerOne: state.players[0].match_score,
                    playerTwo: state.players[1].match_score,
                    winner: 1
                }
                state.players[0].game_scores.push(result);
                state.players[1].game_scores.push(result);
                console.log(state.players[0].game_scores);
                return (1); // Player 2 wins
            }
            this.reInitGameState(state);
        }

        return (0); // no winner
    }

    ballMovement(ball) {
        ball.posx += ball.dirx * ball.speed;
        ball.posy += ball.diry * ball.speed;
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    wallCollision(ball) {
        if (ball.posy >= CANVAS_HEIGHT) {
            ball.diry = -Math.abs(ball.diry);
        }

        if (ball.posy <= 0) {
            ball.diry = Math.abs(ball.diry);
        }
    }

    handleCollision(client: Socket, data: any, server: Server) {
        //const x = data.vx * -1;
        //const y = data.vy * -1;
        server.sockets.in(data.gameCode)
           .emit('collisionResult', {x: data.x, y: data.y, vx: data.vx, vy: data.vy});
    }

    

    randomDir(ball) {
        while (Math.abs(ball.dirx) <= 0.4 || Math.abs(ball.dirx) >= 0.9) {
            const heading = this.randomNumberBetween(0, 2 * Math.PI);
            //console.log("dirx: " + Math.abs(ball.dirx));
            ball.dirx = Math.cos(heading);
            ball.diry = Math.sin(heading);
        }
        ball.speed *= INITIAL_VELOCITY;
    }

    randomNumberBetween(min, max) {
        return Math.random() * (max - min) + min;
    }*/
   

    handleNewGame(client: Socket, server: Server) {
        let roomName = this.makeid(5);
        this.clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);

        this.state[roomName] = this.initGame();
        this.state[roomName].roomName = roomName;

        client.join(roomName);
        this.state[roomName].players[0].id = client.id;
        client.emit('init', 1);
        //this.startGameInterval(roomName, server);
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
            client.emit('tooManyPlayers');
            return;
        }

        this.clientRooms[client.id] = gameCode;

        client.join(gameCode);
        this.state[gameCode].players[1].id = client.id;
        client.emit('init', 2);
        client.broadcast.emit('totalPlayers', 2);

       // this.startGameInterval(gameCode, server);
    }

    async handleDisconnect(client: Socket, server: Server) {

        clearInterval(this.intervalId);
        const roomName = this.clientRooms[client.id];

        let allUsers;
        if (roomName) {
            allUsers = await server.in(roomName).fetchSockets();
            let sockets = [];
            allUsers.forEach(function (s) {
                //console.log(s.id);
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
                console.log(s.id);
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
        //console.log(pos.gameCode);
        //console.log(this.clientRooms);
        //server.sockets.in(pos.gameCode)
        //    .emit('move2', { playerNumber: pos.playerNumber, x: pos.x, y: pos.y});
    }

    handleGameResult(client: Socket, data: any, server: Server) {
        server.sockets.in(data.gameCode)
            .emit('gameResult', { winner: data.winner });
    }
}



