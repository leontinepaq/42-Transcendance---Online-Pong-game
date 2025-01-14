#!/binbash
docker compose down
docker stop $(docker ps -q)
docker rm $(docker ps -aq)
docker rmi -f $(docker images -aq)
docker run --rm -v $(pwd):/code -w /code alpine rm -rf data
