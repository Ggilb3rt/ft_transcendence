import { Injectable, Global } from '@nestjs/common';
import { Game } from './entities/game.entity';
import { Socket, Server } from 'socket.io';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { FRAME_RATE, GRID_SIZE, GameState } from './entities';



@Injectable()
export class GameService {
    /*	messages: Game[] = [{ name: 'Oriane', text: 'hola' }];
	clientToUser = {};
    position: {
        x: 200;
        y: 200
    }*/
    clientRooms = {};
    state = {};
    
    gameState: GameState = {
        players: [{
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
         }, {
            pos: {
                x: 18,
                y: 10
            },
            vel: {
                x: 0,
                y: 0
            },
            snake: [
                {x: 20, y: 10},
                {x: 19, y: 10},
                {x: 18, y: 10}
            ],
         }],
         food: {
            x: 7,
            y: 7
         },
         gridsize: GRID_SIZE 
    }

    createGameState() {
        return this.gameState;
    }

    initGame() {
        const state = this.createGameState();
        this.randomFood(state);
        return state;
    }

    reinitGameState() {
    /*    this.gameState.player.pos.x = 3;
        this.gameState.player.pos.y = 10;
        this.gameState.player.vel.x = 1;
        this.gameState.player.vel.y = 0;
        this.gameState.player.snake = [{x:1, y:10}, {x:2, y:10}, {x:3, y:10}];
        this.gameState.food.x = 7;
        this.gameState.food.y = 7;*/
        this.initGame();
    }

    //startGameInterval(client: Socket, state: GameState)
    startGameInterval(roomName: string, server: Server) {
        const intervalId = setInterval(() => {
            const winner = this.gameLoop(this.state[roomName]);

            if (!winner) {
                this.emitGameState(roomName, this.state[roomName], server);
                //client.emit('gameState', JSON.stringify(state));
            } else {
                this.emitGameOver(roomName, winner, server)
                //client.emit('gameOver');
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


    gameLoop(state: GameState) {
        if (!state) {
            return ;
        }

        const playerOne = state.players[0];
        const playerTwo = state.players[1];

        playerOne.pos.x += playerOne.vel.x;
        playerOne.pos.y += playerOne.vel.y;

        if (playerOne.pos.x < 0 || playerOne.pos.x >= GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y >= GRID_SIZE) {
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

        return false; // no winner
    }

    randomFood(state: GameState) {
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
    }

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

        const vel = this.getUpdatedVelocity(keyCode);

        if (vel) {
            // C'EST QUOI LE CLIENT NUMBER
            //this.state[roomName].players[client.number - 1].vel = vel;
            this.state[roomName].players[0].vel = vel;
            //this.gameState.player.vel = vel;
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

    handleNewGame(client: Socket) {
        let roomName = this.makeid(5);
        this.clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);
        console.log(roomName);

        this.state[roomName] = this.initGame();

        client.join(roomName);
        //console.log(client);
        //client.number = 1;
        client.emit('init', 1);
    }

    makeid(length: number) {
        var result = "";
        var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        //console.log(result);
        return result;
    }

    handleJoinGame(client: Socket, gameCode: string, server: Server) {
        // On parcours les rooms et on recupere celle dont le nom est gameCode
        // PROBLEME ICI
        console.log(this.clientRooms);
        //const room = server.sockets.adapter.rooms[gameCode];
        const room = server.sockets.adapter.rooms.get(gameCode);
        console.log(room);

        let allUsers;
        if (room) {
            //allUsers = room.sockets.clients;
            //allUsers = server.sockets.adapter.rooms[gameCode].sockets;
            allUsers = server.in(gameCode).fetchSockets();
        }

    //    var allUsers = server.sockets.clients(gameCode);

        //console.log(allUsers);

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
        //client.number = 2;
        client.emit('init', 2);

        this.startGameInterval(gameCode, server);
    }
}
