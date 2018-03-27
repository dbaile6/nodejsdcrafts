CREATE TABLE phonebook" (
    "id" SERIAL UNIQUE,
    "name" varchar(20) NOT NULL DEFAULT '',
    "surname" varchar(20) NOT NULL DEFAULT '',
    "phone_number" varchar(12) NOT NULL DEFAULT'',
    PRIMARY KEY ("id")
) TABLESPACE "pg_global";

INSERT INTO "phonebook"("id", "name", "surname", "phone_number") VALUES(1, 'Dylan', 'Bailey', '404-441-4471') RETURNING "id", "name", "surname", "phone_number";
INSERT INTO "phonebook"("id", "name", "surname", "phone_number") VALUES(2, 'John', 'Montevale', '532-123-0981') RETURNING "id", "name", "surname", "phone_number";
