/*import { BALL_SIZE, CANVAS_HEIGHT, CANVAS_WIDTH, BALL_SPEED } from "../constants/constants";

export class Ball {
    posx = (CANVAS_WIDTH / 2) - (BALL_SIZE / 2);
    posy = (CANVAS_HEIGHT / 2) - (BALL_SIZE / 2);
    dirx = 0;
    diry = 0;
    rad = BALL_SIZE;
    speed = BALL_SPEED;
    vel = 0;
}*/

import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../constants";


export class Ball {
    x = CANVAS_WIDTH / 2;
    y = CANVAS_HEIGHT / 2;
    vel = {
        x: 0,
        y: 0,
    }
}
  