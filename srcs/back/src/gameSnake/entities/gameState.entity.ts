export class GameState {
 players: [{
    pos: {
        x: number,
        y: number,
    },
    vel: {
        x: number,
        y: number,
    },
    snake: [
        {x: number, y: number},
        {x: number, y: number},
        {x: number, y: number},
    ],
    id : string;
    },
    {pos: {
        x: number,
        y: number,
    },
    vel: {
        x: number,
        y: number,
    },
    snake: [
        {x: number, y: number},
        {x: number, y: number},
        {x: number, y: number},
    ],
    id: string,
    }];
 food: {
    x: number,
    y: number,
 };
 gridsize: number;   
}