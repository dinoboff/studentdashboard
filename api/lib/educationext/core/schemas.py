"""Resolve json schema

TODO: share them with the GUI apps
TODO: extends schema instead of duplicating properties

"""

from educationext.core import api
from webapp2ext.swagger import String, Array, Boolean



api.schema(
    "User",
    description="A logged in user",
    properties={
        "name": String(
            required=True,
            description=(
                "either the user full name, if the user is registered "
                "or the logged in user's nickname."
            )
        ),
        "photo": String(),
        "studentId": String(),
        "staffId": String(),
        "isAdmin": Boolean(required=True),
        "logoutUrl": String(),
    }
)

api.schema(
    "UserData",
    description="A logged in user",
    properties={
        "email": String(required=True),
        "lastName": String(required=True),
        "firstName": String(required=True),
        "photo": String(),
        "studentId": String(),
        "staffId": String(),
    }
)


api.schema(
    "EditableUserData",
    description="Payload to edit a student data",
    properties= {
        "lastName": String(),
        "firstName": String(),
        "email": String(),
        "photo": String()
    }
)


api.schema(
    "Student",
    description="Public student information schema",
    properties= {
        "lastName": String(required=True),
        "firstName": String(required=True),
        "id": String(required=True),
        "photo": String()
    }
)


api.schema(
    "StudentData",
    description="Complet student schema",
    properties= {
        "lastName": String(required=True),
        "firstName": String(required=True),
        "id": String(required=True),
        "email": String(required=True),
        "photo": String()
    }
)


api.schema(
    "StudentList",
    description="List of student",
    properties= {
        "students": Array(items=api.ref("Student"), required=True),
        "cursor": String(),
    }
)

api.schema(
    "LoginError",
    properties={
        "loginUrl": String(required=True),
        "error": String(required=True),
    }
)


api.schema(
    "Staff",
    description="Staff public information schema",
    properties= {
        "lastName": String(required=True),
        "firstName": String(required=True),
        "id": String(required=True),
        "photo": String()
    }
)


api.schema(
    "StaffData",
    description="Complet staff schema",
    properties= {
        "lastName": String(required=True),
        "firstName": String(required=True),
        "id": String(required=True),
        "email": String(required=True),
        "photo": String()
    }
)

api.schema(
    "StaffList",
    description="List of staff",
    properties= {
        "students": Array(items=api.ref("Staff"), required=True),
        "cursor": String(),
    }
)