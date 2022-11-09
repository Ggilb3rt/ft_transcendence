import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { Ball, Player, WR1, WR2, WR3, WR4 } from './classes';

@Injectable()
export class GameService {
	private waitingRooms = {};
    private activeGames = {
		'abcdef': {},
		'ku3heg3': {}
	};
    private players = {};
	private i = 4;

	constructor() {
		this.waitingRooms[1] = WR1;
		this.waitingRooms[2] = WR2;
		this.waitingRooms[3] = WR3;

        console.log(this.waitingRooms);
	}

    handleConnection(client: Socket, server: Server) {
		//console.log(client.handshake.query.test);

		console.log('CLIENT CONNECTED')
        this.players[client.id] = {
            id: client.id,
            socket: client,
            roomId: "",
            level: 0,
            spectator: false,
			userId: 0,
			type: "player"
        }
        console.log("PLAYERS")
		console.log(Object.keys(this.players));
    }

    handleJoinQueue(client: Socket, data: any, server: Server) {
        const level = data.level;
		const userId = data.userId;
		const player = this.players[client.id];

        let wr = this.waitingRooms[level];

		console.log('JOINING QUEUE level ' + level)
		console.log(client.id);
		console.log(wr);

        this.players[client.id].level = level;
		this.players[client.id].userId = userId;


        // Waiting room is empty
        if (wr.playerOne.id === "" && wr.playerTwo.id === "") {
            console.log("room empty");
            const roomId = this.codeGenerator(5);
            //const roomId = "abcdef";
            wr.roomId = roomId;
            wr.playerOne.id = player.id;
            wr.playerOne.socket = player.socket;
            wr.playerOne.roomId = roomId;
			wr.playerOne.level = level;
			wr.playerOne.userId = userId;
            wr.level = level;
            this.players[player.id].roomId = wr.roomId;
            //console.log(wr);
        }
        // Waiting room has 1 player
        else if (wr.playerOne.id !== "" && wr.playerTwo.id === "") {
            console.log("room waiting");
            wr.playerTwo.id = player.id;
            wr.playerTwo.socket = player.socket;
            wr.playerTwo.roomId = wr.roomId;
			wr.playerTwo.level = level;
			wr.playerTwo.userId = userId;
            this.players[player.id].roomId = wr.roomId;
            // Waiting room has 2 players
            if (wr.playerOne.id !== "" && wr.playerTwo.id !== "") {
                 console.log("room complete");
                const p1 = wr.playerOne;
                const p2 = wr.playerTwo;
                this.activeGames[wr.roomId] = {
                    playerOne: p1,
                    playerTwo: p2,
                    level: level,
                }

                this.initGame(wr.roomId, server);

                // Reset waiting Rooms
				wr.roomId = "";
                wr.playerOne.id = "";
                wr.playerOne.socket = "";
                wr.playerOne.roomId = "";
				wr.playerOne.level = 0;
				wr.playerOne.userId = 0;
                wr.playerTwo.id = "";
                wr.playerTwo.socket = "";
                wr.playerTwo.roomId = "";
				wr.playerTwo.level = 0;
				wr.playerTwo.userId = 0;
				wr.level = 0;
            }
        }
    }

    initGame(roomId: any, server: Server) {
        const gameRoom = this.activeGames[roomId];
		const level = gameRoom.level;
        const playerOne = gameRoom.playerOne.socket;
        const playerTwo = gameRoom.playerTwo.socket;
       
        playerOne.join(roomId);
        playerOne.emit("init", { playerNumber: 1, gameCode: roomId, level: gameRoom.level });
        playerTwo.join(roomId);
        playerTwo.emit("init", { playerNumber: 2, gameCode: roomId, level: gameRoom.level });

        const state = this.createGameState();
        state.players[0].id = gameRoom.playerOne.id;
        state.players[1].id = gameRoom.playerTwo.id;
        state.roomName = roomId;
        gameRoom.state = state;
		console.log("GAMEROOM");
		console.log(gameRoom);
        server.to(roomId).emit("roomComplete", state);
	}

    createGameState() {
        return {
            ball: new Ball,
            players: [
                new Player,
                new Player,
            ],
            roomName: String
        }
    }

    codeGenerator(length: number) : string {
        var result = "";
        var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    handlePlayerMovement(client: Socket, data: any, server: Server) {
        client.to(data.roomName).emit('playerMoved', data)
    }

    handleLaunchBall(client: Socket, data: any, server: Server) {
        const state = this.activeGames[data.roomName].state;
        this.initBall(state.ball);
        //server.to(data.roomName).emit("launchBall", state);
        client.emit("launchBall", state);
    }

    initBall(ball: Ball) {
        let dirx = 0;
        let diry = 0;
        while (Math.abs(dirx) <= 0.6 || Math.abs(dirx) >= 0.9) {
            const heading = this.randomNumberBetween(0, 2 * Math.PI);
            dirx = Math.cos(heading);
            diry = Math.sin(heading);
        }
        ball.initialVelocity.x = dirx * ball.speed;
        ball.initialVelocity.y = diry * ball.speed;
    }

    randomNumberBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    handleMoveBall(client: Socket, data: any, server: Server) {
        client.to(data.roomName).emit("ballMoved", data);

    }

    handleAddPoint(client: Socket, data: any, server: Server) {
        let score = ++this.activeGames[data.roomName].state.players[data.player - 1].match_score;
        if (score === 11) {
            server.to(data.roomName).emit('gameResult', { winner: data.player });
        } else {
            server.to(data.roomName).emit('addPoint', { playerNumber: data.player, score });
        }
    }

    handleWatchGame(client: Socket, data: any, server: Server) {
        //console.log("WATCH GAME");
        //console.log(data.roomName);
		const roomName = data.roomName;
        this.players[client.id].level = 0;
        this.players[client.id].spectator = true;
        this.players[client.id].roomId = roomName;
        if (this.activeGames[roomName]) {
			client.join(roomName);
            client.emit("upDateInfo", this.activeGames[roomName].state);
        }   
    }

    handleDisconnect(client: Socket, server: Server) {
		console.log("CLIENT DISCONNECTED " + client.id);
		
		const roomName = this.players[client.id].roomId;
		const level = this.players[client.id].level;
		const spectator = this.players[client.id].spectator;

		console.log("roomName " + roomName);
		console.log("level  " +level);

		console.log("ACTIVE GAMES 1")
		console.log(this.activeGames);

		if (spectator) {
			client.emit("leftGame", 1)
			Reflect.deleteProperty(this.players, client.id);
		}

		if (roomName) {
			console.log("DISCONNECTING")
			server.in(roomName).emit("leftGame", 1)
			//client.emit("leftGame");
			Reflect.deleteProperty(this.activeGames, roomName);
		}

		if (level !== 0) {
            const wr = this.waitingRooms[level];
			console.log(level);
			if (level === 1 || level === 2 || level === 3) {
           		if (wr.playerOne.id === client.id) {
                	this.switchPlayers(wr.playerOne, wr.playerTwo, wr, 1);
            	} else if (wr.playerTwo.id === client.id) {
                	this.switchPlayers(null, null, wr, 2)
            	}
			}
			else {
				console.log("DELETING WR");
				Reflect.deleteProperty(this.waitingRooms, level);
			}
			client.emit("leftGame", 1);
			//Reflect.deleteProperty(this.waitingRooms, level);
		}
        
		Reflect.deleteProperty(this.players, client.id);

		console.log("ACTIVE GAMES2")
		console.log(this.activeGames);

		console.log(this.waitingRooms);
    }

    async handleQuitGame(client: Socket, data: any, server: Server) {
		console.log("CLIENT QUIT " + client.id);
		console.log(Object.keys(this.activeGames));
	

		const roomName = data.roomName;
		const level = data.level;
		const spectator = this.players[client.id].spectator;

		console.log("roomName " + roomName);
		console.log("level  " +level);

		if (spectator) {
			client.emit("leftGame", 2)
			client.disconnect();
		}


		if (roomName) {
			const connSockets = await server.in(roomName).fetchSockets();
			server.in(roomName).emit("leftGame", 2);
			Reflect.deleteProperty(this.activeGames, roomName);
		} else {
			if (level !== 0) {
				const wr = this.waitingRooms[level];
				if (wr){
				
				if (wr.playerOne.id === client.id) {
					   this.switchPlayers(wr.playerOne, wr.playerTwo, wr, 1);
				   } else if (wr.playerTwo.id === client.id) {
					   this.switchPlayers(null, null, wr, 2);
				   }
			
				   client.emit("leftGame", 2);
				   client.disconnect();
				}
			} 
		}
		console.log(this.waitingRooms);
    }

    switchPlayers(playerOne, playerTwo, wr, n) {
        if (n === 1) {
			wr.roomId = wr.playerTwo.roomId;
            wr.playerOne.id = wr.playerTwo.id;
            wr.playerOne.socket = wr.playerTwo.socket;
            wr.playerOne.roomId = wr.playerTwo.roomId;
            wr.playerOne.level = wr.playerTwo.level;
			wr.playerOne.userId = wr.playerTwo.userId;
        } else {
            wr.playerTwo.id = "";
            wr.playerTWo.socket = "";
            wr.playerTwo.roomId = "";
            wr.playerTwo.level = 0;
			wr.playerTwo.userId = 0;
        }
    }

    handleRematch(client: Socket, data: any, server: Server) {
        //console.log(Object.keys(this.players).length);
		console.log("REMATCH")
        //const roomId = this.players[client.id].roomId;
        const roomId = data.roomName;
		const room = this.activeGames[roomId];
		
		console.log(room);
        let player;
        let opponent;
        let playerNum;
        let winner;
        if (client.id === room.state.players[0].id) {
            player = room.state.players[0]; 
            playerNum = 1;
            opponent = room.state.players[1]
        } else if (client.id === room.state.players[1].id) {
            player = room.state.players[1];
            playerNum = 2;
            opponent = room.state.players[0];
        }

        if (room.state.players[0].match_score === 3) {
            winner = room.state.players[0].id;
        } else {
            winner = room.state.players[1].id;
        }

        let result = {
            winner,
            player: player.id,
            opponent: opponent.id,
            playerScore: player.match_score,
            opponentScore: opponent.match_score,
        }

        player.game_scores.push(result);
        opponent.game_scores.push(result); 

        player.match_score = 0;
        opponent.match_score = 0;


        server.to(data.roomName).emit("rematch");
        //console.log(Object.keys(this.players).length);

        
        
        //console.log(player);
        //console.log(opponent);
    }

	handleMoveAnim(client: Socket, data: any, server: Server) {
		client.to(data.roomName).emit("animMoved", data);
	}

    handleAnimCollision(client: Socket, data: any, server: Server) {
        server.to(data.roomName).emit("animCollision");
    }

	async getActiveRoomNames(client: Socket) : Promise<string[]> {
		this.players[client.id].type = "general";
		const roomNames = await Object.keys(this.activeGames);
		return (roomNames);
	}

	handleCreateGame(client:Socket, data: any, server: Server ) {
		//const level = data.challengeInfo.level;
		const userId = data.userId;
		const player = this.players[client.id];

		this.waitingRooms[this.i] = WR4;
		let wr = this.waitingRooms[this.i];
		/*if ((wr.playerOne.id === "" && wr.playerTwo.id === "") 
			|| (wr.playerOne === userId || wr.playerTwo === userId)
			|| (wr.playerTwo === userId || wr.playerTwo === userId)) {
				wr = this.waitingRooms[this.i];
			}*/

		console.log("USER ID CREATE " + userId)

		player.userId = userId;
		player.level = this.i;

		if (player.userId === data.challengeInfo.challenger ) {
			wr.playerOne.id = player.id;
			wr.playerOne.socket = player.socket;
			wr.playerOne.level = this.i;
			wr.playerOne.userId = userId;
            wr.level = this.i;
		} else if (player.userId === data.challengeInfo.challenged) {
			wr.playerTwo.id = player.id;
			wr.playerTwo.socket = player.socket;
			wr.playerTwo.level = this.i;
			wr.playerTwo.userId = userId;
			wr.level = this.i;
		}

		console.log("WROOM4");
		console.log(this.waitingRooms[this.i]);

		if (wr.playerOne.id !== "" && wr.playerTwo.id !== "") {
			console.log("room CREATION COMPLETE")
			const roomId = this.codeGenerator(5);
			wr.roomId = roomId;
			wr.playerOne.roomId = roomId;
			wr.playerTwo.roomId = roomId;
			wr.level = this.i;
			this.players[wr.playerOne.id].roomId = roomId;
			this.players[wr.playerTwo.id].roomId = roomId;
			this.players[wr.playerOne.id].level = wr.level;
			this.players[wr.playerTwo.id].level = wr.level;
			this.activeGames[roomId] = {
				playerOne: wr.playerOne,
				playerTwo: wr.playerTwo,
				level: this.i,
			}
			console.log(this.activeGames[roomId]);

			this.initGame(wr.roomId, server);

			Reflect.deleteProperty(this.waitingRooms, this.i);
			//++this.i;
		}
	}

	handleJoinGame(client: Socket, data: any, server: Server) {
		
	}
}


