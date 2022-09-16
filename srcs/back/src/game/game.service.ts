import { Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './entities/game.entity';

@Injectable()
export class GameService {
	messages: Game[] = [{ name: 'Oriane', text: 'hola' }];
	clientToUser = {};

	identify(name: string, clientId: string) {
		this.clientToUser[clientId] = name;

		return Object.values(this.clientToUser);
	}

	getClientName(clientId: string) {
		return this.clientToUser[clientId];
	}

  	create(createGameDto: CreateGameDto, clientId: string) {
		const game = { 
			name: this.clientToUser[clientId],
			text: createGameDto.text,
		};

	    this.messages.push(game); // TODO
		return game;
	}

 	 findAll() {
		// Si DB, ici on la requete
  	  return this.messages;
 	 }
}
