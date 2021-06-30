## Backend REST API for rainbow-tracker.

### Development setup   
The development environment (postgres and pgadmin4) can be quickly setup using the docker-compose.yml file provided.
Before starting up containers, you should create two folders on host for pgadmin4 and postgres to have persistent data.
The folders are /data/pgadmin4 and /data/postgres-rainbow respectively. You should adjust the access to pgadmin4 folder using the following command
`sudo chown -R 5050:5050 <host_directory>`.
Then run `docker-compose up -d` and head to localhost:5050 to login to pgadmin4. Use credentials:    
- email: emils@gmail.com
- password: 911     

Then in pgadmin4 connect to postgres     
- host: postgres
- port: 5432
- maintenance database: rainbow
- username: rainbow
- password: 911      

Of course most of this can be changed in the docker-compose.yml file.
