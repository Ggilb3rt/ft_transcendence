import { CANVAS_HEIGHT, DEFAULT_PADDLE_H, DEFAULT_PADDLE_W, DEFAULT_PADDLE_SPEED } from "../constants";

export class Player {
    posx = 0;
    posy = (CANVAS_HEIGHT / 2) - (DEFAULT_PADDLE_H / 2);
    width = DEFAULT_PADDLE_W;
    height = DEFAULT_PADDLE_H;
    speed = DEFAULT_PADDLE_SPEED;
    vel = 0;
    up = false;
    down = false;
    id = null;
}
  