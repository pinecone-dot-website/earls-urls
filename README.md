# earls-urls

## earl shortener

## .env file
Define your postgres db connection string, server port, and session secret.

```sh
DATABASE_URL="postgres://user@host/dbname"
PORT=5000
JWT_SECRET="abc"
SESSION_SECRET="def"
```

## Create database tables
```sh
npx sequelize-cli db:migrate
```

## Build and serve for development
```
yarn run build:dev
yarn run serve:dev
```

## Start local database
```
pg_ctl -D /usr/local/var/postgres start
```