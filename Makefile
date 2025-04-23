all:		up

hard-up:
				docker compose -f ./docker-compose.yml up --force-recreate

up:
				docker compose -f ./docker-compose.yml up --build --watch

down:
				docker compose -f ./docker-compose.yml down

stop:
				docker compose -f ./docker-compose.yml stop

re:				down up

populate_db:
				cat ./srcs/backend/populate_db.py | \
				docker exec --interactive backend python ./apps/manage.py shell
				@for f in pp/*; do \
					if [ -f "$$f" ]; then \
						docker cp "$$f" backend:/media/avatars/; \
					fi; \
				done