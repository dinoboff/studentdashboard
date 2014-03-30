"""Common models for all api branches

Defines:

- User: model for a logging user data, including its student or staff id.
- Students.
- Staff.


"""
from google.appengine.ext import ndb
from google.appengine.datastore.datastore_query import Cursor

from educationext.core import api
from educationext.core.exceptions import (
    ModelError, CannotRegisterError, ValidationError, DuplicateEntityError
)


class UserData(object):
    """User, student and staff shared models

    Because student or staff entity might be created before their
    users log in (and create a user entity), they need to share some the
    data.

    """
    email = ndb.ComputedProperty(lambda self: self.data.get('email'))
    full_name = ndb.ComputedProperty(
        lambda self: "%s, %s" % (
            self.data.get('lastName', ''),
            self.data.get('firstName', ''),
        )
    )

    @property
    def last_name(self):
        return self.data.get('lastName')

    @property
    def first_name(self):
        return self.data.get('firstName')

    @property
    def photo(self):
        return self.data.get('photo')

    @classmethod
    def by_email(cls, email, **kw):
        return cls.query().filter(cls.email == email).get(**kw)

    def summary(self):
        data = self.data.copy()
        del data['email']
        return data

    def _pre_put_hook(self):
        """Make sure data attribute is validate format some field
        before saving an entity.

        Note: idealy, formatting would not happen at this stage, but it
        simplify queries since queries over text is case sensitive.

        """
        self.validate(self.data)
        if 'id' in self.data and self.key and self.key.id() != self.data['id']:
            raise ModelError("The id cannot be edited")

        for prop_name in ["firstName", "lastName"]:
            self.data[prop_name] = self.data[prop_name].title()


class User(ndb.Model, UserData):
    """Logging user data.

    Associate a user id to a student or a staff mumber.

    Can also be used to store user preferences.

    """
    data = ndb.JsonProperty()
    student_id = ndb.ComputedProperty(lambda self: self.data.get('studentId'))
    staff_id = ndb.ComputedProperty(lambda self: self.data.get('staffId'))

    @property
    def student(self):
        if self.student_id:
            return ndb.Key(Student, self.student_id).get()

    @property
    def staff(self):
        if self.staff_id:
            return ndb.Key(Staff, self.staff_id).get()

    def _pre_put_hook(self):
        UserData._pre_put_hook(self)

    @classmethod
    def new_user(cls, user):
        data = {
            "email": user.email()
        }

        keys = []
        for field, model in (("studentId", Student,), ("staffId", Staff,),):
            key = model.by_email(data['email'], keys_only=True)
            if key:
                data[field] = key.id()
                keys.append(key)

        if not keys:
            raise CannotRegisterError("This user is neither staff or student.")

        entity = keys.pop().get()
        data['lastName'] = entity.data['lastName']
        data['firstName'] = entity.data['firstName']
        if entity.data.get('photo'):
            data['photo'] = entity.data.get('photo')

        @ndb.transactional(xg=True, retries=0)
        def tx():
            existing_user = cls.get_by_id(user.user_id())
            if existing_user:
                raise ModelError(
                    "A user with the same id already exists."
                )

            new_user = cls(id=user.user_id(), data=data)
            new_user.put()
            return new_user
        return tx()

    @classmethod
    def by_student_id(cls, student_id, **kw):
        return cls.query().filter(cls.student_id == student_id).get(**kw)

    @classmethod
    def by_staff_id(cls, staff_id, **kw):
        return cls.query().filter(cls.staff_id == staff_id).get(**kw)

    def update_details(self, data):
        """Update user's data and associated student and staff entities

        TODO: make async.

        """
        @ndb.transactional(xg=True)
        def tx():
            user_data = dict([
                (k, data.get(k),) for k in (
                    'lastName', 'firstName', 'email', 'photos'
                ) if data.get(k) is not None
            ])
            api.validate('EditableUserData', user_data)

            entities = []
            user = self.key.get()
            user.data.update(data)
            entities.append(user)

            student = user.student
            if student:
                student.data.update(user_data)
                entities.append(student)

            staff = user.staff
            if staff:
                staff.data.update(user_data)
                entities.append(staff)

            return ndb.put_multi(entities)
        return tx()

    @staticmethod
    def validate(data):
        """Validate student data schema.

        """
        api.validate("UserData", data)


class Staff(ndb.Model, UserData):
    """Staff entity model

    """
    data = ndb.JsonProperty()

    @property
    def staff_id(self):
        return self.key.id()

    def _pre_put_hook(self):
        UserData._pre_put_hook(self)

    @classmethod
    def new_staff(cls, data):
        @ndb.transactional(xg=True, retries=0)
        def tx():
            existing_staff = cls.get_by_id(data['id'])
            if existing_staff:
                raise ModelError(
                    "A staff member with the same id already exists."
                )

            staff = cls(id=data['id'], data=data)
            staff.put()
            return staff
        return tx()

    @classmethod
    def get_staff(cls, cursor_key=None):
        """Get the list of staff, 20 at a time.

        return a list of staff, a cursor for the next query and boolean
        indication if there might be more student to query.

        """
        cursor = Cursor(urlsafe=cursor_key) if cursor_key else None
        q = cls.query().order(cls.full_name)
        return q.fetch_page(20, start_cursor=cursor)

    @staticmethod
    def validate(data):
        """Validate student data schema.

        """
        api.validate("StaffData", data)


class Student(ndb.Model, UserData):
    """Student entity model.

    """
    data = ndb.JsonProperty()

    @property
    def student_id(self):
        return self.key.id()

    @ndb.transactional()
    def update_details(self, details):
        api.validate('EditableUserData', details)
        student = self.key.get()
        student.data.update(details)
        student.put()
        self.data = student.data

    def public_data(self):
        """Filter confidencial information out of the data

        """
        clone = self.data.copy()
        del clone['email']
        return clone

    def _pre_put_hook(self):
        UserData._pre_put_hook(self)

    @classmethod
    def new_student(cls, data):
        """Create a new student entity from its json representation

        """
        if 'id' not in data:
            raise ValidationError("A student should have student id.")

        @ndb.transactional(xg=True, retries=0)
        def tx():
            existing_student = Student.get_by_id(data['id'])
            if existing_student:
                raise DuplicateEntityError(
                    "A student with the same id already exists."
                )

            student = cls(id=data['id'], data=data)
            student.put()
            return student
        return tx()

    @classmethod
    def get_students(cls, cursor_key=None):
        """Get the list of student, 20 at a time.

        return a list of student, a cursor for the next query and boolean
        indication if there might be more student to query.

        """
        cursor = Cursor(urlsafe=cursor_key) if cursor_key else None
        q = cls.query().order(cls.full_name)
        return q.fetch_page(20, start_cursor=cursor)


    @staticmethod
    def validate(data):
        """Validate student data schema.

        """
        api.validate("StudentData", data)
