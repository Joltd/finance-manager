FROM nginx:alpine

COPY ./dist/finance-manager /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
