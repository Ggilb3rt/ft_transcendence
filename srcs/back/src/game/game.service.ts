import { Injectable, Global } from '@nestjs/common';
import { Game } from './interfaces/game.entity';
import { Socket, Server } from 'socket.io';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { FRAME_RATE, GRID_SIZE, INITIAL_VELOCITY, CANVAS_WIDTH, DEFAULT_PADDLE_W } from './interfaces';
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
            ]
        }
    }

    initGame() {
        const state = this.createGameState();
        this.setPlayerPos(state.players);
        this.randomDir(state.ball);
        return state;
    }

    reinitGameState() {
        this.initGame();
    }

    setPlayerPos(players) {
        let playerOne = players[0];
        playerOne.posx = 2;

        let playerTwo = players[1];
        playerTwo.posx = CANVAS_WIDTH - DEFAULT_PADDLE_W - 2;
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

        this.paddleCollision(ball, players);

        this.paddleMovement(players)

        /*    if ((ball.pos.x + ball.rad) >= 640) {
                return (2); // Player 1 wins
            }
            if ((ball.pos.x - ball.rad) <= 0) {
                return (1); // Player 2 wins
            }*/

        /* let paddleOne = state.players[0];
         if ((paddleOne.pos.y <= 0)) {
             paddleOne.pos.y = 0;
         } else if (paddleOne.pos.y + paddleOne.dim.h >= 480) {
             paddleOne.pos.y = 480 - paddleOne.dim.h;
         }*/

        //return 0;


        /*   const playerOne = state.player[0];
           const playerTwo = state.player[1];
   
           playerOne.x += playerOne.vel;
           playerOne.y += playerOne.vel;
   
           playerTwo.x += playerTwo.vel;
           playerTwo.y += playerTwo.vel;*/

        /*    if (playerOne.pos.x < 0 || playerOne.pos.x >= GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y >= GRID_SIZE) {
                console.log("1");
                return (2); // player 2 wins (player 1 went out of the grid)
            }
    
            if (playerTwo.pos.x < 0 || playerTwo.pos.x >= GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y >= GRID_SIZE) {
                return (1); // player 1 wins (player 2 went out of the grid)
            }
    
            if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
                playerOne.snake.push({ ...playerOne.pos });
                playerOne.pos.x += playerOne.vel.x;
                playerOne.pos.y += playerOne.vel.y;
                this.randomFood(state);
            }
    
            if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
                playerTwo.snake.push({ ...playerTwo.pos });
                playerTwo.pos.x += playerTwo.vel.x;
                playerTwo.pos.y += playerTwo.vel.y;
                this.randomFood(state);
            }*/

        /*if (playerOne.vel) {
            for (let cell of playerOne.snake) {
                if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
                    console.log("2");
                    return (2); // player 2 wins (player 1 overlaped)
                }
            }
            
            playerOne.snake.push({ ...playerOne.pos });
            playerOne.snake.shift();
        }

        if (playerTwo.vel.x || playerTwo.vel.y) {
            for (let cell of playerTwo.snake) {
                if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
                    return (1); // player 1 wins (player 2 overlaped)
                }
            }
            
            playerTwo.snake.push({ ...playerTwo.pos });
            playerTwo.snake.shift();
        }*/

        //return false; // no winner*/

        return (0);


    }

    ballMovement(ball) {
        ball.posx += ball.dirx * ball.speed;
        ball.posy += ball.diry * ball.speed;
    }

    wallCollision(ball) {
        if ((ball.posy - ball.rad) <= 0 || (ball.posy + ball.rad) >= 480) {
            ball.diry *= -1;
        }

        if ((ball.posx - ball.rad) <= 0 || (ball.posx + ball.rad) >= 640) {
            ball.dirx *= -1;
        }
    }

    paddleCollision(ball, players) {


    }

    paddleMovement(players) {
        let playerOne = players[0];
        //let playerTwo = players[1];
        // ATTENTION VITESSE DONNE ICI ARBITRAIRE
        if (playerOne.speed === 1) {
            playerOne.posy += 10;
        } else if (playerOne.speed === -1) {
            playerOne.posy -= 10;
        }
       // playerOne.speed = 0;

        let playerTwo = players[1];
        //let playerTwo = players[1];
        // ATTENTION VITESSE DONNE ICI ARBITRAIRE
        if (playerTwo.speed === 1) {
            playerTwo.posy += 10;
        } else if (playerTwo.speed === -1) {
            playerTwo.posy -= 10;
        }
        //playerTwo.vel = 0;
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
            this.state[roomName].players[playerNumber].speed = vel;
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

        console.log("ON EST LA");
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

        this.state[roomName].players[playerNumber].speed = 0;
    }


    handleNewGame(client: Socket, server: Server) {
        let roomName = this.makeid(5);
        this.clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);

        this.state[roomName] = this.initGame();

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


        // Erreur a resoudre : quand deux joueurs jouent dans une room, l'erreur too many players OK.
        // Mais si le player 1 part, et que le troisieme joueur retente le truc avec le meme gameCode, CRASH
        // Pareil quand les deux joueurs sont partis.

        /*  const gameCode = this.clientRooms[client.id];
           const room = await server.sockets.adapter.rooms.has(gameCode);
           if (room) {
               this.clientRooms[gameCode].splice();
           }*/
    }
}
