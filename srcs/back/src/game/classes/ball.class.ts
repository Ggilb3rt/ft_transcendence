export class Ball {
	speed: number;
	initialVelocity = {
		x: 0,
		y: 0
	};
	level: number;

	constructor() {
		this.speed = 450;
		this.initialVelocity =
		{
			x: 0,
			y: 0,
		};
		this.level = 0;
	}
}
