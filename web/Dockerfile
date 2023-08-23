FROM nginx:alpine

COPY ./dist/template-app /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
