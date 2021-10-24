DROP TABLE IF EXISTS app_user CASCADE;
DROP TABLE IF EXISTS week CASCADE;
DROP TABLE IF EXISTS note CASCADE;
DROP TABLE IF EXISTS category_type CASCADE;
DROP TABLE IF EXISTS activity_type CASCADE;
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS analytics_category CASCADE;
DROP TABLE IF EXISTS analytics_activity CASCADE;


CREATE TABLE app_user (
	userid VARCHAR(50),
	email VARCHAR(320) UNIQUE NOT NULL,
	password VARCHAR(250) NOT NULL,
	salt VARCHAR(50) NOT NULL,
	PRIMARY KEY(userid)
);

CREATE TABLE week (
    weekid VARCHAR(50),
    userid VARCHAR(50) NOT NULL,
    "weekNr" INT NOT NULL,
    "weekYear" INT NOT NULL,
	PRIMARY KEY(weekid),
	CONSTRAINT fk_user FOREIGN KEY(userid) REFERENCES app_user(userid) ON DELETE CASCADE,
	CONSTRAINT "weekNr" CHECK (
	    "weekNr" > 0
	),
	CONSTRAINT "weekYear" CHECK (
	    "weekYear" > 0
	),
	UNIQUE(userid, "weekNr", "weekYear")
);

CREATE TABLE note (
    weekid VARCHAR(50) NOT NULL,
    "weekDay" INT NOT NULL,
    "notePosition" INT NOT NULL,
    stackid VARCHAR(50) NOT NULL,
    userid VARCHAR(50) NOT NULL,
    note VARCHAR,
    "weekDayDate" DATE NOT NULL,
    PRIMARY KEY(weekid, "weekDay", "notePosition"),
    CONSTRAINT fk_user FOREIGN KEY(userid) REFERENCES app_user(userid) ON DELETE CASCADE,
    CONSTRAINT fk_week FOREIGN KEY(weekid) REFERENCES week(weekid),
    CONSTRAINT "weekDay" CHECK (
        "weekDay" > -1 AND "weekDay" < 7
    )
);

CREATE TABLE category_type (
    categoryid VARCHAR(50),
    userid VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    archived BOOLEAN NOT NULL,
    PRIMARY KEY(categoryid),
    CONSTRAINT fk_user FOREIGN KEY(userid) REFERENCES app_user(userid) ON DELETE CASCADE
);

CREATE TABLE activity_type (
    activityid VARCHAR(50),
    categoryid VARCHAR(50) NOT NULL,
    userid VARCHAR(50) NOT NULL,
    long VARCHAR(100) NOT NULL,
    short VARCHAR(2) NOT NULL,
    archived BOOLEAN NOT NULL,
    PRIMARY KEY(activityid),
    CONSTRAINT fk_category FOREIGN KEY(categoryid) REFERENCES category_type(categoryid),
    CONSTRAINT fk_user FOREIGN KEY(userid) REFERENCES app_user(userid) ON DELETE CASCADE
);

CREATE TABLE category (
    weekid VARCHAR(50),
    "weekDay" INT NOT NULL,
    "categoryPosition" INT NOT NULL,
    userid VARCHAR(50) NOT NULL,
    categoryid VARCHAR(50),
    activityid VARCHAR(50),
    "weekDayDate" DATE NOT NULL,
    PRIMARY KEY(weekid, "weekDay", "categoryPosition"),
    CONSTRAINT fk_week FOREIGN KEY(weekid) REFERENCES week(weekid),
    CONSTRAINT fk_category FOREIGN KEY(categoryid) REFERENCES category_type(categoryid),
    CONSTRAINT fk_activity FOREIGN KEY(activityid) REFERENCES activity_type(activityid),
    CONSTRAINT fk_user FOREIGN KEY(userid) REFERENCES app_user(userid) ON DELETE CASCADE,
    CONSTRAINT "weekDay" CHECK (
        "weekDay" > -1 AND "weekDay" < 7
    )
);

INSERT INTO app_user(userid, email, password, salt) VALUES('81823c86-ef44-4885-9933-929ed75e0876', 'test@test.com', '09e323bac42cbcdcd27a1f0e060c0ac2cd35b9a34b233975b30997fa096f5836b39aa083dc139a12ea123809c212c70d49aa', '6c605af47e13bf6b51bd3b6bc0b26eff');