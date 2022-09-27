import { Injectable, Global } from '@nestjs/common';
import { Game } from './classes/game.class';
import { Socket, Server } from 'socket.io';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { FRAME_RATE, INITIAL_VELOCITY, CANVAS_WIDTH, DEFAULT_PADDLE_W, CANVAS_HEIGHT, DEFAULT_PADDLE_H } from './constants';
import { Ball, Player } from "./classes";


@Injectable()
export class GameService {
    private clientRooms = {};
    private state = {};

    createGameState() {
        return {
            ball: new Ball,
            players: [
                new Player,
                new Player,
            ],
            roomName: String,
        }
    }

    initGame() {
        const state = this.createGameState();
        this.setPlayerPos(state.players);
        this.randomDir(state.ball);
        return state;
    }

    reinitGameState() {
        return this.initGame();
    }

    setPlayerPos(players) {
        let playerOne = players[0];
        playerOne.posx = 2;

        let playerTwo = players[1];
        playerTwo.posx = CANVAS_WIDTH - playerTwo.width - 2;
    }

    startGameInterval(roomName: string, server: Server) {
        const intervalId = setInterval(() => {
            const winner = this.gameLoop(this.state[roomName]);

            if (!winner) {
                this.emitGameState(roomName, this.state[roomName], server);
            } else {
                this.emitGameOver(roomName, winner, server)
                clearInterval(intervalId);
                this.state[roomName] = null;
            }

        }, 1000 / FRAME_RATE);
    }

    emitGameState(roomName: string, state: any, server: Server) {
        server.sockets.in(roomName)
            .emit('gameState', JSON.stringify(state));
    }

    emitGameOver(roomName: string, winner, server: Server) {
        server.sockets.in(roomName)
            .emit('gameOver', JSON.stringify({ winner }));
    }

    gameLoop(state) {
        if (!state) {
            return;
        }

        let ball = state.ball;
        this.ballMovement(ball);
        this.wallCollision(ball);

        let players = state.players;
        this.paddleMovement(players)
        this.paddleCollision(ball, players);

        // attention erreur ici probablement
        if ((ball.posx + ball.rad) <= 0) {
            return (2); // Player 1 wins
        }
          /*  if ((ball.pos.x - ball.rad) <= 0) {
                return (1); // Player 2 wins
            }*/

        return (0); // no winner
    }

    ballMovement(ball) {
        ball.posx += ball.dirx * ball.speed;
        ball.posy += ball.diry * ball.speed;
    }

    wallCollision(ball) {
        if ((ball.posy - ball.rad) <= 0 || (ball.posy + ball.rad) >= 480) {
            ball.diry *= -1;
        }

        if (/*(ball.posx - ball.rad) <= 0 || */(ball.posx + ball.rad) >= 640) {
            ball.dirx *= -1;
        }
    }

    paddleCollision(ball, players) {
        // https://stackoverflow.com/questions/17768301/top-of-paddle-collision-detection-pong

        let playerOne = players[0];

        if (ball.posx <= playerOne.posx + playerOne.width) {
            var rad = ball.rad / 2;
            var padding = 3;

            if (ball.posx + padding >= playerOne.posx + playerOne.width
                && ball.posy - rad >= playerOne.posy
                && ball.posy + rad <= playerOne.posy + playerOne.height) {

                console.log("front connect");
                ball.dirx *= -1;
                console.log("TAPPE1");

            } else if (ball.posy - CANVAS_HEIGHT >= playerOne.posy
                && ball.posy <= playerOne.posy
                && ball.posx - rad >= playerOne.posx) {

                var x = ball.posx + rad;
                var y = ball.posy + rad;
                var px = playerOne.posx + playerOne.width;
                var py = playerOne.posy;

                if (ball.posy + CANVAS_HEIGHT > playerOne.posy) {
                    py += playerOne.height;
                }

                var dist = Math.pow(Math.pow(x - px, 2) + Math.pow(y - py, 2), 0.5);

                if (dist <= rad && dist >= rad - padding) {
                    var angle = Math.asin(x - px / y - py);
                    ball.diry = (-ball.diry * Math.cos(angle)) + (-ball.dirx * Math.sin(angle));
                    ball.dirx = (-ball.dirx * Math.cos(angle)) + (-ball.diry * Math.sin(angle));
                    console.log("TAPPEE2");
                }
            }
        }
    }

    paddleMovement(players) {
        let playerOne = players[0];
        if (playerOne.vel === 1) {
            playerOne.posy += playerOne.speed * INITIAL_VELOCITY;
        } else if (playerOne.vel === -1) {
            playerOne.posy -= playerOne.speed * INITIAL_VELOCITY;
        }

        if (playerOne.posy <= 0) {
            playerOne.posy = 0;
        } else if (playerOne.posy + DEFAULT_PADDLE_H >= CANVAS_HEIGHT) {
            playerOne.posy = CANVAS_HEIGHT - DEFAULT_PADDLE_H;
        }

        let playerTwo = players[1];
        if (playerTwo.vel === 1) {
            playerTwo.posy += playerTwo.speed * INITIAL_VELOCITY;
        } else if (playerTwo.vel === -1) {
            playerTwo.posy -= playerTwo.speed * INITIAL_VELOCITY;
        }
    }

    randomDir(ball) {
        while (Math.abs(ball.dirx) <= 0.2 || Math.abs(ball.dirx) >= 0.9) {
            const heading = this.randomNumberBetween(0, 2 * Math.PI);
            ball.dirx = Math.cos(heading);
            ball.diry = Math.sin(heading);
        }
        ball.speed *= INITIAL_VELOCITY;
    }

    randomNumberBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    handleKeydown(client: Socket, keyCode: any) {
        const roomName = this.clientRooms[client.id];

        if (!roomName) {
            return;
        }

        try {
            keyCode = parseInt(keyCode);
        } catch (e) {
            console.error(e);
            return;
        }

        let playerNumber;
        if (this.state[roomName].players[0].id === client.id) {
            playerNumber = 0;
        } else {
            playerNumber = 1;
        }

        const vel = this.getUpdatedVelocity(keyCode);

        if (vel) {
            this.state[roomName].players[playerNumber].vel = vel;
        }

    }

    getUpdatedVelocity(keyCode: number) {
        switch (keyCode) {
            case 38: // down
                return -1;
            case 40: // up
                return 1;
        }
    }

    handleKeyup(client: Socket, keyCode: any) {
        const roomName = this.clientRooms[client.id];

        if (!roomName) {
            return;
        }

        try {
            keyCode = parseInt(keyCode);
        } catch (e) {
            console.error(e);
            return;
        }

        if (keyCode !== 38 && keyCode !== 40) {
            return;
        }

        let playerNumber;
        if (this.state[roomName].players[0].id === client.id) {
            playerNumber = 0;
        } else {
            playerNumber = 1;
        }

        this.state[roomName].players[playerNumber].vel = 0;
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

        this.startGameInterval(gameCode, server);
    }

    async handleDisconnect(client: Socket, server: Server) {

        const roomName = this.clientRooms[client.id];

        let allUsers;
        if (roomName) {
            allUsers = await server.in(roomName).fetchSockets();
            console.log("hola");
            let sockets = [];
            allUsers.forEach(function(s) {
                console.log(s.id);
                s.emit('disconnected');
                s.leave(roomName);
                sockets.push(s.id);
            });
            sockets.forEach( socket => Reflect.deleteProperty(this.clientRooms, socket));
        }
        
        Reflect.deleteProperty(this.clientRooms, client.id);
    }

    handleReMatch(client: Socket, gameCode: string, server: Server) {
        console.log("hello");
        this.state[gameCode] = this.initGame();
        console.log(this.state[gameCode]);
        this.startGameInterval(gameCode, server);
    }
}
