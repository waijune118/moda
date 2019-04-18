docker build -t modaapp .
docker run -p 3000:3000 --name modaApp modaapp
docker rm $(docker ps -a -q)
