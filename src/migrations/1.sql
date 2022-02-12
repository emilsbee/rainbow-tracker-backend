CREATE TABLE session (
  userid VARCHAR(50) NOT NULL,
  "refreshToken" VARCHAR(50) UNIQUE NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  PRIMARY KEY(userid, "refreshToken"),
  CONSTRAINT fk_user FOREIGN KEY(userid) REFERENCES app_user(userid) on DELETE CASCADE 
);
