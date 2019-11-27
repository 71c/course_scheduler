from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Course(db.Model):
    __tablename__ = 'course'
    id = db.Column(db.Integer, primary_key=True)
    # Example: MATH-0042
    course_num = db.Column(db.String, nullable=False)
    # Example: MATH
    subject = db.Column(db.string, nullable=False)
    # Example: Mathematics
    subject_long = db.Column(db.string, nullable=False)
    # Example: Calculus III
    course_title = db.Column(db.String, nullable=False)
    # example: Vectors in two and three dimensions, applications of the derivative of vector-valued functions of a single variable. Functions of several variables, continuity, partial derivatives, the gradient, directional derivatives. Multiple integrals and their applications. Line integrals, Green's theorem, divergence theorem, Stokes\u2019 theorem. Prerequisite: MATH 34 or 39.
    desc_long = db.Column(db.String, nullable=False)



class Passenger(db.Model):
    __tablename__ = 'passengers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    flight_id = db.Column(db.Integer, db.ForeignKey('flights.id'), nullable=False)
