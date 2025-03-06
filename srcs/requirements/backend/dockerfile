FROM	python
USER 	root
RUN		apt-get update -y &&\
	apt-get install -y iputils-ping
ENV		PYTHONUNBUFFERED=1
COPY	./requirements.txt ./requirements.txt
RUN		pip install -r requirements.txt
COPY	./apps /apps
COPY	./entrypoint.sh ./entrypoint.sh
ENTRYPOINT [ "/bin/bash", "./entrypoint.sh" ]