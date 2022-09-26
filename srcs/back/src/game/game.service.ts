import { Injectable, Global } from '@nestjs/common';
import { Game } from './entities/game.entity';
import { Socket, Server } from 'socket.io';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { FRAME_RATE, GRID_SIZE, GameState } from './entities';



@Injectable()
export class GameService {
    clientRooms = {};
    state = {};

    createGameState() {
    /*    return  {players: [{
            pos: {
                x: 3,
                y: 10
            },
            vel: {
                x: 1,
                y: 0
            },
            snake: [
                {x: 1, y: 10},
                {x: 2, y: 10},
                {x: 3, y: 10}
            ],
            id: null,
            }, {
            pos: {
                x: 2,
                y: 11,
            },
            vel: {
                x: 0,
                y: -1,
            },
            snake: [
                {x: 4, y: 11},
                {x: 3, y: 11},
                {x: 2, y: 11}
            ],
            id: null,
         }],
         food: {
            x: 7,
            y: 7
         },
         gridsize: GRID_SIZE }*/
        return {
            ball: {
                pos: {
                    x: 100,
                    y: 75,
                },
                speed: {
                    x: 1,
                    y: 1
                },
                size: 10,
            },
            players: [{
                pos: {
                    x: 0,
                    y: 10,
                },
                speed: {
                    x: 0,
                    y: 0,
                },
                id: null,
            }, 
            {
                pos: {
                    x: 0,
                    y: 10,
                },
                speed: {
                    x: 0,
                    y: 0,
                }, 
                id: null,
            }]
        }
    }

    initGame() {
        const state = this.createGameState();
        //this.randomFood(state);
        return state;
    }

    reinitGameState() {
        this.initGame();
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

    emitGameState(roomName: string, state: GameState, server: Server) {
        server.sockets.in(roomName)
            .emit('gameState', JSON.stringify(state));
    }

    emitGameOver(roomName: string, winner, server: Server) {
        server.sockets.in(roomName)
            .emit('gameOver', JSON.stringify({winner}));
    }


    gameLoop(state) {
        if (!state) {
            return ;
        }

        //console.log(state);
        state.ball.pos.x += state.ball.speed.x;
        //state.ball.pos.y += state.ball.speed.y;
        //console.log(state);

        //if (state.ball.pos.y < 0 || state.ball.pos.y >= GRID_SIZE) {
        //    state.balle.pos.y *= -1;
        //    return (false);
        //}
    /*    if (state.ball.pos.x < 0 || state.ball.pos.x >= GRID_SIZE) {
            state.ball.speed.x *= -1;
            //return (1);
        }*/

        return false;

    /*    console.log(state);
        
        const playerOne = state.players[0];
        const playerTwo = state.players[1];

        playerOne.pos.x += playerOne.vel.x;
        playerOne.pos.y += playerOne.vel.y;

        playerTwo.pos.x += playerTwo.vel.x;
        playerTwo.pos.y += playerTwo.vel.y;

        if (playerOne.pos.x < 0 || playerOne.pos.x >= GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y >= GRID_SIZE) {
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
        }

        if (playerOne.vel.x || playerOne.vel.y) {
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
        }

        return false; // no winner*/



    }

 /*   randomFood(state) {
        let food = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        }

        for (let cell of state.players[0].snake) {
            if (cell.x === food.x && cell.y === food.y) {
                return (this.randomFood(state))
            }
        }

        for (let cell of state.players[1].snake) {
            if (cell.x === food.x && cell.y === food.y) {
                return (this.randomFood(state))
            }
        }

        state.food = food;
    }*/

    handleKeydown(client: Socket, keyCode : any) {
        const roomName = this.clientRooms[client.id];
        
        if (!roomName) {
            return ;
        }

        try {
            keyCode = parseInt(keyCode);
        } catch(e) {
            console.error(e);
            return ;
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

    getUpdatedVelocity(keyCode : number) {
        switch (keyCode) {
            case 37: // left
                return {x: -1, y: 0};
            case 38: // down
                return {x: 0, y: -1};
            case 39: // right
                return {x: 1, y: 0};
            case 40: // up
                return {x: 0, y: 1};
        }
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
            return ;
        } else if (numClients > 1) { // Trop de joueurs
            client.emit('tooManyPlayers');
            return ;
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

       /* const gameCode = this.clientRooms[client.id];
        const room = await server.sockets.adapter.rooms.has(gameCode);
        if (room) {
            this.clientRooms[gameCode].splice();
        }*/
    }
}
