import { CANVAS_HEIGHT, DEFAULT_PADDLE_H, DEFAULT_PADDLE_W, SPEED } from "../interfaces";

export class Player {
    posx = 0;
    posy = (CANVAS_HEIGHT / 2) - DEFAULT_PADDLE_H;
    width = DEFAULT_PADDLE_W;
    height = DEFAULT_PADDLE_H;
    speed = SPEED;
    up = false;
    down = false;
    id = null;
}
  