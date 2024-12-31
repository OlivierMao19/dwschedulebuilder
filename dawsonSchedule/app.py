from cs50 import SQL
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

db = SQL("sqlite:///schedule.db")

@app.route("/", methods=['GET', 'POST'])
def index():
    return render_template("index.html")

@app.route("/search")
def search():
    q = request.args.get("q")
    if q:
        courses = db.execute("SELECT * FROM courses WHERE course_code LIKE ?", q + "%")
    else:
        courses = []
    return jsonify(courses)

@app.route("/time", methods=['GET', 'POST'])
def timetable():
    content = request.get_json()
    try:
        course_id = content["course_id"]
        course_code = db.execute("SELECT course_code FROM courses WHERE id = :course_id", course_id=course_id)[0]['course_code']
    except KeyError:
        course_code = content["course_code"]
        course_id = db.execute("SELECT id FROM courses WHERE course_code = :course_code", course_code=course_code)[0]['id']

    sections = db.execute("SELECT * FROM sections WHERE course_id = :course_id", course_id=course_id)

    for section in sections:
        time = db.execute("SELECT Monday, Tuesday, Wednesday, Thursday, Friday FROM timetable WHERE section_id = :section_id", section_id=section["id"])
        if time:
            section["schedule"] = time[0]

    sections = [{"course_id":course_id, "course_code": course_code}] + sections
    return jsonify(sections)



