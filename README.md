# Deployment

GitHub Actions secrets, that should be specified
* DOCKER_USERNAME - Docker Hub username
* DOCKER_PASSWORD - Docker Hub password
* DB_HOST - database host (e.g. localhost:5432)
* DB_USER - 
* DB_PASSWORD -
* REMOTE_HOST - host for deploy and run docker compse
* REMOTE_USER
* REMOTE_PRIVATE_KEY - private key for ssh connection

Logs available by command

```docker cp <container_id>:/app/logs .```