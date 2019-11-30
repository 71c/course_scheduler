from flask_sqlalchemy import SQLAlchemy
from flask import Flask
import os

db = SQLAlchemy()

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)


class Course(db.Model):
    __tablename__ = 'courses'
    id = db.Column(db.Integer, primary_key=True)
    # Example: MATH-0042
    course_num = db.Column(db.String, nullable=False)
    # Example: MATH
    subject = db.Column(db.String, nullable=False)
    # Example: Mathematics
    subject_long = db.Column(db.String, nullable=False)
    # Example: Calculus III
    title = db.Column(db.String, nullable=False)
    # Example: Vectors in two and three dimensions, applications of the ...
    desc_long = db.Column(db.String, nullable=False)

    sections = db.relationship("Section", backref="course", lazy='joined')


class Section(db.Model):
    __tablename__ = 'sections'
    id = db.Column(db.Integer, primary_key=True)
    # Example: 24147
    class_num = db.Column(db.Integer, nullable=False)
    # Example: 01-LEC
    section_num = db.Column(db.String, nullable=False)
    # Example: 1
    assoc_class = db.Column(db.Integer, nullable=False)
    # component/comp_desc; Lecture, Recitation, Laboratory, Studio, etc
    component = db.Column(db.String, nullable=False)
    # shorthand component; LEC, RCT, LAB, STU, etc
    component_short = db.Column(db.String, nullable=False)
    # can be "O" (open), "C" (closed), or "W", (waitlist)
    status = db.Column(db.String, nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)

    periods = db.relationship("Period", backref="section", lazy='joined')

    def intersects(self, other):
        for period_1 in self.periods:
            for period_2 in other.periods:
                if self.day == other.day and (period_1.meet_start_min <= period_2.meet_end_min and period_1.meet_end_min >= period_2.meet_start_min):
                    return True
        return False

    def evaluate(self):
        return [self]


class Period(db.Model):
    __tablename__ = 'periods'
    id = db.Column(db.Integer, primary_key=True)
    day = db.Column(db.String, nullable=False)
    meet_start_min = db.Column(db.Integer, nullable=False)
    meet_end_min = db.Column(db.Integer, nullable=False)
    section_id = db.Column(db.ForeignKey('sections.id'), nullable=False)
