FROM AWS_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/nginx:1.17.4-alpine

RUN rm -f /etc/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/nginx/conf.d/default.conf /etc/nginx/conf.d/
COPY docker/nginx/nginx.conf /etc/nginx/

RUN mkdir -p /home/ubuntu/soco-admin/dist
COPY dist /home/ubuntu/soco-admin/dist

WORKDIR /home/ubuntu/soco-admin