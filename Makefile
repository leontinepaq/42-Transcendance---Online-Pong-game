all:		up

hard-up:
			docker compose -f ./srcs/docker-compose.yml up --force-recreate

up:
			docker compose -f ./srcs/docker-compose.yml up --build --watch

down:
			docker compose -f ./srcs/docker-compose.yml down 

stop:
			docker compose -f ./srcs/docker-compose.yml stop

re:			down up

populate_db:
			cat ./srcs/requirements/backend/populate_db.py | \
			docker exec --interactive backend python ./apps/manage.py shell