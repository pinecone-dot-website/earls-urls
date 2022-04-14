# earls-urls

## earl shortener

## .env file
Define your postgres db connection string, server port, and session secret.

```sh
DATABASE_URL="postgres://user@host/dbname"
PORT=5000
SESSION_SECRET="abc"
```

## Create users table
```pgsql
CREATE TABLE IF NOT EXISTS users (
	id integer DEFAULT nextval('users_id_seq'::regclass) NOT NULL,
	username character varying(40),
	"password" character varying(255)
);

CREATE SEQUENCE users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE UNIQUE INDEX unique_username ON public.users USING btree (username);
```

## Create urls table
```pgsql
CREATE TABLE urls (
    id serial,
    url text,
    "timestamp" timestamp without time zone DEFAULT now(),
    user_id integer
);

CREATE SEQUENCE public.urls_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
```