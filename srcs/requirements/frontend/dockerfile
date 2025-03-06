FROM	nginx
USER 	root
RUN		apt-get update -y &&\
	apt-get install -y iputils-ping
COPY	nginx.conf /etc/nginx/nginx.conf
RUN		openssl req -x509 -nodes \
	-out /home/ca.crt \
	-keyout /home/ca.key \
	-subj "/C=FR/ST=Paris/L=Paris/O=42/OU=42/CN=localhost/UID=admin_name"
COPY	./site/ /site/