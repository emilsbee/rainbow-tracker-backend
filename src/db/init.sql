CREATE TABLE users (
	user_id VARCHAR(50),
	email VARCHAR(320) UNIQUE NOT NULL,
	password VARCHAR(50) NOT NULL,
	role VARCHAR(3) NOT NULL,
	PRIMARY KEY(user_id)
);

CREATE TABLE weeks (
    week_id VARCHAR(50),
    user_id VARCHAR(50) NOT NULL,
    week_number INT NOT NULL,
    week_year INT NOT NULL,
	PRIMARY KEY(week_id),
	CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(user_id),
	CONSTRAINT week_number CHECK (
	    week_number > 0
	),
	CONSTRAINT week_year CHECK (
	    week_year > 0
	),
	UNIQUE(user_id, week_number, week_year)

);

CREATE TABLE notes (
    week_id VARCHAR(50) NOT NULL,
    week_day INT NOT NULL,
    note_position INT NOT NULL,
    stack_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    note VARCHAR,
    PRIMARY KEY(week_id, week_day, note_position),
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(user_id),
    CONSTRAINT fk_week FOREIGN KEY(week_id) REFERENCES weeks(week_id),
    CONSTRAINT week_day CHECK (
        week_day > -1 AND week_day < 7
    )
);

CREATE TABLE category_type (
    category_id VARCHAR(50),
    user_id VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    archived BOOLEAN NOT NULL,
    PRIMARY KEY(category_id),
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE activity_type (
    activity_id VARCHAR(50),
    category_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    long VARCHAR(100) NOT NULL,
    short VARCHAR(2) NOT NULL,
    archived BOOLEAN NOT NULL,
    PRIMARY KEY(activity_id),
    CONSTRAINT fk_category FOREIGN KEY(category_id) REFERENCES category_type(category_id),
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE categories (
    week_id VARCHAR(50),
    week_day INT NOT NULL,
    category_position INT NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    category_id VARCHAR(50),
    activity_id VARCHAR(50),
    PRIMARY KEY(week_id, week_day, category_position),
    CONSTRAINT fk_week FOREIGN KEY(week_id) REFERENCES weeks(week_id),
    CONSTRAINT fk_category FOREIGN KEY(category_id) REFERENCES category_type(category_id),
    CONSTRAINT fk_activity FOREIGN KEY(activity_id) REFERENCES activity_type(activity_id),
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(user_id),
    CONSTRAINT week_day CHECK (
        week_day > -1 AND week_day < 7
    )
);

CREATE TABLE analytics_category (
    category_id VARCHAR(50),
    freq INT NOT NULL,
    week_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    PRIMARY KEY(category_id),
    CONSTRAINT fk_category FOREIGN KEY(category_id) REFERENCES category_type(category_id),
    CONSTRAINT fk_week FOREIGN KEY(week_id) REFERENCES weeks(week_id),
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE analytics_activity (
    activity_id VARCHAR(50),
    freq INT NOT NULL,
    week_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    PRIMARY KEY(activity_id),
    CONSTRAINT fk_activity FOREIGN KEY(activity_id) REFERENCES activity_type(activity_id),
    CONSTRAINT fk_week FOREIGN KEY(week_id) REFERENCES weeks(week_id),
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(user_id)
);