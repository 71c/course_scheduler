# course_scheduler
Automatic course scheduler for Tufts which gets meeting times from Tufts SIS (unintended) JSON API, finds all the possible schedules for the given classes, removes those that do not specify a given criteria, e.g. classes cannot start before 9am, and then rates all the remaining schedules according to a given function, e.g. the sum of all durations of periods between classes which are say >= 30 minutes.

Under development. At some point there will be a website.
