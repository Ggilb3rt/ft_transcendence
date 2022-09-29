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

    reInitGameState(state) {

        let newPlayer = new Player;
        let newBall = new Ball;

        state.ball.posx = newBall.posx;
        state.ball.posy = newBall.posy;
        state.ball.dirx = newBall.dirx;
        state.ball.diry = newBall.diry;
        state.ball.rad = newBall.rad;
        state.ball.speed = newBall.speed;
        state.ball.vel = newBall.vel;
        this.randomDir(state.ball);

        state.players[0].posx = newPlayer.posx;
        state.players[0].posy = newPlayer.posy;
        state.players[0].width = newPlayer.width;
        state.players[0].height = newPlayer.height;
        state.players[0].speed = newPlayer.speed;
        state.players[0].vel = newPlayer.vel;


        state.players[1].posx = newPlayer.posx;
        state.players[1].posy = newPlayer.posy;
        state.players[1].width = newPlayer.width;
        state.players[1].height = newPlayer.height;
        state.players[1].speed = newPlayer.speed;
        state.players[1].vel = newPlayer.vel;
        this.setPlayerPos(state.players);
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

        if ((ball.posx + ball.rad) <= 0) {
            return (2); // Player 1 wins
        } else if ((ball.posx - ball.rad) >= CANVAS_WIDTH) {
            return (1); // Player 2 wins
        }

        return (0); // no winner
    }

    ballMovement(ball) {
        ball.posx += ball.dirx * ball.speed;
        ball.posy += ball.diry * ball.speed;
    }

    wallCollision(ball) {
        //  if ((ball.posy - ball.rad) <= 0 || (ball.posy + ball.rad) >= CANVAS_HEIGHT) {
        //     ball.diry *= -1;
        //  }

        /*if ((ball.posx - ball.rad) <= 0 || (ball.posx + ball.rad) >= CANVAS_WIDTH) {
           ball.dirx *= -1;
        }*/

        if (ball.posy >= CANVAS_HEIGHT) {
            ball.diry = -Math.abs(ball.diry);
        }

        if (ball.posy <= 0) {
            ball.diry = Math.abs(ball.diry);
        }
    }

    paddleCollision(ball, players) {

        var rad = ball.rad / 2;
        var padding = 3;
        var x, y, px, py;

        let p1 = players[0];

        if (p1.posy >= CANVAS_HEIGHT) {
            p1.posy = CANVAS_HEIGHT;
        } else if (p1.posy <= 0) {
            p1.posy = 0;
        }

        if (ball.posx <= p1.posx + p1.width) {

            if (ball.posx + padding >= p1.posx + p1.width
                && ball.posy >= p1.posy
                && ball.posy - rad <= p1.posy + p1.height) {

                console.log("front connect");
                ball.dirx = -ball.dirx;

            } else if (ball.posy - CANVAS_HEIGHT >= p1.posy
                && ball.posy <= p1.posy
                && ball.posx - rad >= p1.posx) {

                x = ball.posx + rad;
                y = ball.posy + rad;

                px = p1.posx + p1.width;
                py = p1.posy;

                if (ball.posy + CANVAS_HEIGHT > p1.posy) {
                    py += p1.height;
                }

                var dist = Math.pow(Math.pow(x - px, 2) + Math.pow(y - py, 2), 0.5);

                if (dist <= rad && dist >= rad - padding) {
                    var angle = Math.asin(x - px / y - py);
                    ball.diry = (-ball.diry * Math.cos(angle)) + (-ball.dirx * Math.sin(angle));
                    ball.dirx = (-ball.dirx * Math.cos(angle)) + (-ball.diry * Math.sin(angle));
                }
            }
        }

        let p2 = players[1];

        if (p2.posy >= CANVAS_HEIGHT) {
            p2.posy = CANVAS_HEIGHT;
        } else if (p2.posy <= 0) {
            p2.posy = 0;
        }
        
        if (ball.posx >= p2.posx) {
            if (ball.posx - padding <= p2.posx
                && ball.posy >= p2.posy
                && ball.posy - rad <= p2.posy + p2.height) {

                console.log("front connect");
                ball.dirx = -ball.dirx;
                
            } else if (ball.posy - CANVAS_HEIGHT >= p2.posy
                && ball.posy <= p2.posy
                && ball.posx - rad <= p2.posx + p2.width) {

                x = ball.posx + rad;
                y = ball.posy + rad;

                px = p2.posx;
                py = p2.posy;
                if (ball.posy + CANVAS_HEIGHT > p2.posy) {
                    py += p2.height;
                }

                var dist = Math.pow(Math.pow(x - px, 2) + Math.pow(y - py, 2), 0.5);

                if (dist <= rad && dist >= rad - padding) {
                    var angle = Math.asin(x - px / y - py);
                    ball.diry = (-ball.diry * Math.cos(angle)) + (-ball.dirx * Math.sin(angle));
                    ball.dirx = (-ball.dirx * Math.cos(angle)) + (-ball.diry * Math.sin(angle));
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
        while (Math.abs(ball.dirx) <= 0.8 || Math.abs(ball.dirx) >= 0.9) {
            const heading = this.randomNumberBetween(0, 2 * Math.PI);
            //console.log("dirx: " + Math.abs(ball.dirx));
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
            let sockets = [];
            allUsers.forEach(function (s) {
                console.log(s.id);
                s.emit('disconnected');
                s.leave(roomName);
                sockets.push(s.id);
            });
            sockets.forEach(socket => Reflect.deleteProperty(this.clientRooms, socket));
        }

        Reflect.deleteProperty(this.clientRooms, client.id);
    }

    handleReMatch(client: Socket, gameCode: any, server: Server) {
        server.sockets.in(gameCode).emit("reMatch", JSON.stringify("rematch !!"));
        this.reInitGameState(this.state[gameCode]);
        this.startGameInterval(gameCode, server);
    }
}


