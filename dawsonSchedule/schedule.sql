CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    course_code VARCHAR(11) UNIQUE NOT NULL
);

CREATE TABLE sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL ,
    course_id INT NOT NULL,
    course_full_title TEXT NOT NULL,
    section VARCHAR(5) NOT NULL,
    teacher TEXT NOT NULL,
    comment TEXT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE timetable (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    section_id INT UNIQUE NOT NULL,
    Monday TEXT,
    Tuesday TEXT,
    Wednesday TEXT,
    Thursday TEXT,
    Friday TEXT,
    FOREIGN KEY (section_id) REFERENCES sections(id)
);
