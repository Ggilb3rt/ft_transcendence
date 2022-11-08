import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { Ball, Player, WR1, WR2, WR3 } from './classes';

@Injectable()
export class GameService {
	private waitingRooms = {};
    private activeGames = {};
    private players = {};

	constructor() {
		this.waitingRooms[1] = WR1;
		this.waitingRooms[2] = WR2;
		this.waitingRooms[3] = WR3;

        console.log(this.waitingRooms);
	}

    handleConnection(client: Socket, server: Server) {
		//console.log(client.handshake.query.test);

        this.players[client.id] = {
            id: client.id,
            socket: client,
            roomId: "",
            level: 0,
            spectator: false,
			userId: 0,
			type: "player"
        }
        //console.log("PLAYERS")
        //console.log(this.players);
    }

    handleJoinQueue(client: Socket, data: any, server: Server) {
        const level = data.level;
		const userId = data.userId;
		const player = this.players[client.id];

        let wr = this.waitingRooms[level];

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
        if (score === 3) {
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

    async handleDisconnect(client: Socket, server: Server) {
		console.log("ALL PLAYERS BEFORE DISCONNECT")
		console.log(Object.keys(this.players));
		const roomName = this.players[client.id].roomId;
        const level = this.players[client.id].level;
		const userId = this.players[client.id].userId;
		console.log("level disconnet " + level);
		console.log(client.id);
		//console.log("USER ID " + userId);

        if (this.players[client.id].spectator) {
            console.log("spectator disconnected");
            client.emit("leftGame", 1);
            Reflect.deleteProperty(this.players, client.id);
            return;
        }

		//console.log(roomName);
		//console.log(this.activeGames[roomName]);
        if (this.activeGames[roomName]) {
			console.log("existing room name");
            let connSockets = await server.in(roomName).fetchSockets();
            connSockets.forEach((s) => {
				console.log("s disconnected");
				console.log(s.id);
                s.emit("leftGame", 1);
                s.leave(roomName);
				//s.close();
                s.disconnect();
                Reflect.deleteProperty(this.players, s.id);
            })
            Reflect.deleteProperty(this.activeGames, roomName);
        } else if (this.players[client.id].level !== 0) {
            const wr = this.waitingRooms[level];
       
            if (wr.playerOne.id === client.id) {
                this.switchPlayers(wr.playerOne, wr.playerTwo, wr, 1);
            } else if (wr.playerTwo.id === client.id) {
                this.switchPlayers(null, null, wr, 2)
            }
        }
        Reflect.deleteProperty(this.players, client.id);

		console.log("ACTIVE GAMES DISCO");
		console.log(this.activeGames);

		//console.log("WAITING ROOMS DISOC");
		//console.log(this.waitingRooms);

		console.log("PLAYERS DISCO")
		console.log(Object.keys(this.players));

    }

    async handleQuitGame(client: Socket, server: Server) {
		console.log("ALL PLAYERS BEFORE QUIT")
		console.log(Object.keys(this.players));
        const roomName = this.players[client.id].roomId;
        const level = this.players[client.id].level;
		const userId = this.players[client.id].userId;
		console.log("level quit " + level)
		console.log(client.id);
		//console.log("USER ID " + userId);
        
        if (this.players[client.id].spectator) {
            console.log("spectator left");
            console.log(this.players[client.id].roomId)
            this.players[client.id].roomId = "";
            this.players[client.id].spectator = false;
			client.leave(roomName);
            client.emit("leftGame", 2);
			//client.close();
			client.disconnect(true);
			Reflect.deleteProperty(this.players, client.id);
            return;
        }

        if (this.activeGames[roomName]) {
            client.emit("leftGame", 3);
            client.disconnect();
			//client.close();
            Reflect.deleteProperty(this.players, client.id);

            let connSockets = await server.in(roomName).fetchSockets();
            connSockets.forEach((s) => {
                s.emit("leftGame", 2);
                s.leave(roomName);
				//s.close();
                s.disconnect();
				Reflect.deleteProperty(this.players, s.id);
            })
            Reflect.deleteProperty(this.activeGames, roomName);
        } else if (this.players[client.id].level !== 0) {
            const wr = this.waitingRooms[level];
    
            if (wr.playerOne.id === client.id) {
                   this.switchPlayers(wr.playerOne, wr.playerTwo, wr, 1);
               } else if (wr.playerTwo.id === client.id) {
                   this.switchPlayers(null, null, wr, 2);
               }

			client.emit("leftGame", 3);
			client.disconnect();
			//client.close();
			Reflect.deleteProperty(this.players, client.id);
        }
		console.log("ACTIVE GAMES QUIT");
		console.log(this.activeGames);

		//console.log("WAITING ROOMS QUIT");
		//console.log(this.waitingRooms);

		console.log("PLAYERS QUIT")
		console.log(Object.keys(this.players));
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
        const roomId = this.players[client.id].roomId;
        const room = this.activeGames[roomId];
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

	async getActiveRoomNames() : Promise<string[]> {
		this.players[client.id].type = "general";
		const roomNames = await Object.keys(this.activeGames);
		return (roomNames);
	}

}


