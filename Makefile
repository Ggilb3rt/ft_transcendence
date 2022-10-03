.PHONY: all re clean remove rm_volumes create_vol up ps down build images remove logs logs_wordpress logs_mariadb logs_nginx

all: build up

re: clean all

# Create

create_vol:
	mkdir -p $(PWD)/data/bdd
	sudo chown -R $(USER) $(PWD)/data
	sudo chmod -R 775 $(PWD)/data

build:
	docker-compose build

# Use
up:
	docker-compose up

down:
	docker-compose down

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
	-docker image rm ft_transcendence_back
	-docker image rm front-vue
	-docker image rm postgres:alpine

# Debug
go_front:
	docker exec -ti ft_transcendence_front_1 bash
go_back:
	docker exec -ti ft_transcendence-back-1 bash
go_bdd:
	docker exec -ti ft_transcendence_postgres_1 bash


logs:
	docker-compose logs ft_transcendence_front_1 ft_transcendence_back_1 ft_transcendence_postgres_1
logs_back:
	docker-compose logs ft_transcendence_back_1
logs_front:
	docker-compose logs ft_transcendence_front_1
logs_bdd:
	docker-compose logs ft_transcendence_postgres_1

outside_ip:
	docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ft_transcendence_back_1