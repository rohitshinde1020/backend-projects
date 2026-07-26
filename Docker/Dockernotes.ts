/* what is docker container ? 
A docker container is a lightweight, standalone, executable package that includes everything needed to run a piece of software,
including the code, runtime, system tools, libraries, and settings.
so we create a docker container from a docker image. A docker image is a read-only template that contains the instructions for creating a container.

provide me with some docker commands
docker pull <image_name> - used to pull a docker image from a registry
docker run -it <image_name> /bin/bash - used for running a container in interactive mode with a bash shell
docker ps - used to list all running containers
docker images - used to list all available images on the local machine
docker build -t <image_name> .- used to build a docker image from a Dockerfile in the current directory
docker stop <container_id> - used to stop a running container
docker start <container_id> - used to start a stopped container 
docker rm <container_id> - used to remove a stopped container
docker rmi <image_name> - used to remove a docker image from the local machine
docker run <image_name> - used to run a container from a specified image
docker ps -a - used to list all containers, including stopped ones


RABBITMQ CHANNEL METHODS
| Method             | Purpose                                          |
| ------------------ | ------------------------------------------------ |
| `assertQueue()`    | Create/ensure a queue exists                     |
| `sendToQueue()`    | Send message directly to a queue                 |
| `consume()`        | Continuously receive messages                    |
| `get()`            | Fetch one message                                |
| `ack()`            | Tell RabbitMQ processing succeeded               |
| `nack()`           | Tell RabbitMQ processing failed                  |
| `reject()`         | Reject one message                               |
| `assertExchange()` | Create/ensure an exchange exists                 |
| `publish()`        | Publish message to an exchange                   |
| `bindQueue()`      | Connect a queue to an exchange                   |
| `unbindQueue()`    | Remove queue ↔ exchange binding                  |
| `prefetch()`       | Limit unacknowledged messages sent to a consumer |
| `purgeQueue()`     | Remove waiting messages                          |
| `deleteQueue()`    | Delete a queue                                   |
| `close()`          | Close the channel                                |

*/