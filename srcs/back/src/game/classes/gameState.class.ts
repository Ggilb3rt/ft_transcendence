import { PlayerWR } from "./waitingRoom.class";

class BallState {
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

class PlayerState {
	id: number;
	match_score: number;
	userId: number;

	// constructor(player: PlayerWR) {
	// 	const { id, userId } = player;
	// 	this.id = id;
	// 	this.userId = userId;
	// 	this.match_score = 0;
	// }

	constructor() {
	 	this.id = 0;
			this.userId = 0;
			this.match_score = 0;
		 }
}


export class GameState {
	level: number;
	ball: BallState;
	players: PlayerState[];
	roomName: String;

	//constructor(playerOne: PlayerWR, playerTwo: PlayerWR, level: number, roomName: string) {
	constructor() {
		this.level= 0;
        this.ball = new BallState();
        this.players = [
                new PlayerState(),
                new PlayerState(),
        ];
            this.roomName =  "";
	}
}
	/*this.level = level;
		this.ball = new BallState();
		this.players = [
			new PlayerState(playerOne),
			new PlayerState(playerTwo),
		];
		this.roomName = roomName;
	}*/

	/*level: 0,
            ball: new Ball(),
            players: [
                new Player(playerOne),
                new Player(playerTwo),
            ],
            roomName: "",
		}*/

	