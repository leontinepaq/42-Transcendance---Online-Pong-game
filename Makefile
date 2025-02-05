all:		up

hard-up:
			docker compose -f ./srcs/docker-compose.yml up --force-recreate

up:
			docker compose -f ./srcs/docker-compose.yml up --build

down:
			docker compose -f ./srcs/docker-compose.yml down 

stop:
			docker compose -f ./srcs/docker-compose.yml stop

rm-volumes:
			rm -drf $(HOME)/data/**/**