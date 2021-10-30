## Backend REST API for rainbow-tracker.

### Development setup
1. `git clone https://github.com/emilsbee/rainbow-tracker-backend`
2. `yarn install`
3. Make sure you have folders `/data/postgres-rainbow`, `/data/pgadmin4`, `/data/redis-rainbow`, `/data/redis-rainbow-test`. If setting up
   the development environment from scratch, and you already have these folders, make sure to remove any data from them. 
   Furthermore, make sure to run `sudo chown -R 5050:5050 /data/pgadmin4` to give permission.
4. Create a `.env` file at the root of the project. Move everything from `.env.example` to the `.env` file.
5. Run `docker-compose up -d` from the root of the project to start up the containers specified in `docker-compose.yaml`.
6. Pgadmin4 is available on `localhost:5050`. Use login: 
- email: emils@gmail.com
- password: 911    
        
Then, add a new server within Pgadmin4 using the following credentials:
- host: postgres
- port: 5432
- maintenance database: rainbow
- username: rainbow
- password: 911

7. A user is automatically created with credentials
- email: test@test.com
- password: password