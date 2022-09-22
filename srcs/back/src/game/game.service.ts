import { Injectable } from '@nestjs/common';
import { Game } from './entities/game.entity';
import { Socket } from 'socket.io';
import { FRAME_RATE, GRID_SIZE, GameState } from './entities';

@Injectable()
export class GameService {
/*	messages: Game[] = [{ name: 'Oriane', text: 'hola' }];
	clientToUser = {};
    position: {
        x: 200;
        y: 200
    }*/

    gameState: GameState = {
        player: {
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
         },
         food: {
            x: 7,
            y: 7
         },
         gridsize: GRID_SIZE 
    }

    getGameState() {
        return this.gameState;
    }

    reinitGameState() {
        this.gameState.player.pos.x = 3;
        this.gameState.player.pos.y = 10;
        this.gameState.player.vel.x = 1;
        this.gameState.player.vel.y = 0;
        this.gameState.player.snake = [{x:1, y:10}, {x:2, y:10}, {x:3, y:10}];
        this.gameState.food.x = 7;
        this.gameState.food.y = 7;
    }

    startGameInterval(client: Socket, state: GameState) {
        const intervalId = setInterval(() => {
            const winner = this.gameLoop(state);

            if (!winner) {
                client.emit('gameState', JSON.stringify(state));
            } else {
                client.emit('gameOver');
                clearInterval(intervalId);
            }

        }, 1000 / FRAME_RATE);
    }

    gameLoop(state: GameState) {
        if (!state) {
            return ;
        }

        const playerOne = state.player;

        playerOne.pos.x += playerOne.vel.x;
        playerOne.pos.y += playerOne.vel.y;

        if (playerOne.pos.x < 0 || playerOne.pos.x >= GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y >= GRID_SIZE) {
            return (2); // player 2 wins (player 1 went out of the grid)
        }

        if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
            playerOne.snake.push({ ...playerOne.pos });
            playerOne.pos.x += playerOne.vel.x;
            playerOne.pos.y += playerOne.vel.y;
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

        return false; // no winner
    }

    randomFood(state: GameState) {
        let food = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        }

        for (let cell of state.player.snake) {
            if (cell.x === food.x && cell.y === food.y) {
                return (this.randomFood(state))
            }
        }
        state.food = food;
    }

    handleKeydown(state: GameState, keyCode : any) {
        try {
            keyCode = parseInt(keyCode);
        } catch(e) {
            console.error(e);
            return ;
        }

        const vel = this.getUpdatedVelocity(keyCode);

        if (vel) {
            this.gameState.player.vel = vel;
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
}
