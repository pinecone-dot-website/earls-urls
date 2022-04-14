#earls-urls

##earl shortener

##.env file
Define your db connection string and port

```
DATABASE_URL="postgres://user@host/dbname"
PORT=5000
```

##Database schema:

###urls


  Column   |            Type             |              Modifiers              
-----------+-----------------------------+-------------------------------------
 id        | integer                     | default nextval('id_seq'::regclass)
 url       | text                        | 
 timestamp | timestamp without time zone | default now()
 user_id   | integer                     | 



###users

  Column  |          Type          |                     Modifiers                      
----------+------------------------+----------------------------------------------------
 id       | integer                | not null default nextval('users_id_seq'::regclass)
 username | character varying(40)  | 
 password | character varying(255) | 
Indexes:
    "users_username_key" UNIQUE, btree (lower(username::text))



```
CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
```

`ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);`

`CREATE UNIQUE INDEX users_username_key ON users USING btree (lower((username)::text));`

##Front-end
`gulp default|watch`

## Create database
CREATE database earls_urls;

## Use database
\c earls_urls

## Create urls table
```
CREATE TABLE urls (
    id serial,
    url text,
    "timestamp" timestamp without time zone DEFAULT now(),
    user_id integer
);
```

## Create users table
```
CREATE TABLE users (
    id serial,
    username character varying(40),
    password character varying(255)
);
```