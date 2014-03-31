import urllib

from educationext.dashboard import api
from educationext.dashboard import models
from educationext.core.utils import ApiRequestHandler
from educationext.core.models import Student
from webapp2ext import swagger


class RepositoryFiledHandler(ApiRequestHandler):
    """Handle File listing requests

    """
    resource = api.resource(
        path="/files",
        desc="Operations about current user authentication"
    )
    path = resource.endpoint('/repository/<studentId>/files')

    @path.operation(
        type_="FileList",
        alias="getRepositoryById",
        parameters=[
            swagger.String(
                name="cursor",
                description="Cursor to query the next page",
                param_type="query"
            ),
            swagger.String(
                name="studentId",
                param_type="path",
                description="Id of student details to edit",
                required=True
            )
        ],
        responses=[
            swagger.Message(200, "Ok"),
            swagger.Message(400, "Bad Request"),
            swagger.Message(401, "Unauthorized"),
            swagger.Message(403, "Forbidden")
        ]
    )
    def get(self, studentId):
        """List all the files at destination to a specific student

        """
        student = Student.get_by_id(studentId)
        if student is None:
            self.abort(404)

        user = self.get_current_user_data()

        if user is None or user.staffId is None or user.studentId != studentId:
            self.admin_required()

        cursor_key = self.request.GET.get('cursor')

        # using cheap request and ndb entities cache
        file_keys, cursor, _ = models.File.get_files(
            student.key, cursor_key, keys_only=True
        )
        ffiles = [k.get_async() for k in file_keys]

        self.render_json({
            'files': [ff.get_result().summary() for ff in ffiles],
            'cursor': cursor.urlsafe() if cursor else ''
        })
