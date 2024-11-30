-- init-databases.sql

CREATE DATABASE filedb;
CREATE DATABASE dms;

-- Optional: Grant privileges to the default user
GRANT ALL PRIVILEGES ON DATABASE filedb TO dms_user;
GRANT ALL PRIVILEGES ON DATABASE dms TO dms_user;
