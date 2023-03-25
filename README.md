# earls-urls

## earl shortener

## .env file
Define your postgres db connection string, server port, and session secret.

```sh
DATABASE_URL="postgres://user@host/dbname"
JWT_SECRET="abc"
PORT=5000
SESSION_SECRET="def"
```

## Create database tables
```sh
npx sequelize-cli db:migrate
```

## Build and serve for development
```
yarn run build-server:dev
yarn run run-server:dev
```

## Start local database
```
pg_ctl -D /usr/local/var/postgres start
```