create TABLE "user"(
    uid UUID PRIMARY KEY,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100),
    nickname VARCHAR(30)
);

create TABLE "tag"(
    id SERIAL PRIMARY KEY,
    creator UUID,
    name VARCHAR(40),
    sortOrder INTEGER DEFAULT 0
);

create TABLE "userTag"(
    id SERIAL PRIMARY KEY,
    userId UUID REFERENCES "user" (uid) ON UPDATE CASCADE ON DELETE CASCADE,
    tagId SERIAL REFERENCES "tag" (id) ON UPDATE CASCADE ON DELETE CASCADE  
);