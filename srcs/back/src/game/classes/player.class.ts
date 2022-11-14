export class Player {
	id: number;
	match_score: number;
	userId: number;

	constructor(player) {
		const { id, userId } = player;
		this.id = id;
		this.userId = userId;
		this.match_score = 0;
	}
}


  