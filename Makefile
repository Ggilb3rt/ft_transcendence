.PHONY: all re clean remove rm_volumes create_vol up ps down build images remove logs logs_wordpress logs_mariadb logs_nginx

all: create_vol build up

re: clean all

# Create

create_vol:
	mkdir -p $(PWD)/data/bdd
	sudo chown -R $(USER) $(PWD)/data
	sudo chmod -R 775 $(PWD)/data

build:
	docker-compose -f ./srcs/docker-compose.yml build

# Use
up:
	docker-compose -f ./docker-compose.yml up

down:
	docker-compose -f ./docker-compose.yml down

ps:
	docker ps -a

images:
	docker images -a

# Remove
rm_volumes:
	if [ -d "$(PWD)/data" ]; then \
		sudo chown -R $(USER) $(PWD)/data \
		&& sudo chmod -R 775 $(PWD)/data \
		&& rm -rf $(PWD)/data; \
	fi
	-docker volume rm ft_transcendence_postgres_persistence
	-docker volume prune -f

remove: down
	docker images prune
	docker container prune -f
	docker system prune -f

clean: remove rm_volumes

fclean: clean
	-docker image rm wordpress
	-docker image rm mariadb
	-docker image rm nginx

# Debug
go_front:
	docker exec -ti pongFront bash
go_back:
	docker exec -ti pongBack bash
go_bdd:
	docker exec -ti pongBdd bash


logs:
	cd srcs && docker compose logs pongFront pongBack pongBdd
logs_wordpress:
	cd srcs && docker compose logs wordpress
logs_mariadb:
	cd srcs && docker compose logs mariadb
logs_nginx:
	cd srcs && docker compose logs nginx

outside_ip:
	docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' MyNginx