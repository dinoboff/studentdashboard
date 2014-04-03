import json
import urllib

import webapp2
from educationext.core.models import Student, User
from educationext.core.utils import ApiRequestHandler
from google.appengine.api import users
from google.appengine.ext import blobstore
from google.appengine.ext.webapp import blobstore_handlers
from jsonschema import ValidationError
from webapp2ext import swagger

from educationext.dashboard import api, config
from educationext.dashboard import models


resource = api.resource(
    path="/files",
    desc="Operations about current user authentication"
)


class RepositoryFiledHandler(ApiRequestHandler):
    """Handle File listing requests

    """
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
            swagger.Message(403, "Forbidden"),
            swagger.Message(404, "Not Found")
        ]
    )
    def get(self, studentId):
        """List all the files at destination to a specific student

        """
        student = Student.get_by_id(studentId)
        if student is None:
            self.abort(404)

        user = self.get_current_user_data()

        if not user or user.staff_id is None or user.student_id != studentId:
            self.admin_required()

        cursor_key = self.request.GET.get('cursor')

        # using cheap request and ndb entities cache
        file_keys, cursor, _ = models.File.get_files(
            student.key, cursor_key, keys_only=True
        )
        ffiles = [k.get_async() for k in file_keys]

        self.render_json({
            'files': map(
                self.file_dict,
                [ff.get_result() for ff in ffiles]
            ),
            'cursor': cursor.urlsafe() if cursor else ''
        })

    def file_dict(self, file_):
        data = file_.summary()
        data['url'] = self.uri_for('download_file', keyId=file_.key.id())
        return data


class UploadUrlHandler(ApiRequestHandler):
    path = resource.endpoint('/repository/<studentId>/uploadurl')

    @path.operation(
        type_='BlobStoreUploadInfo',
        alias='newUploadUrl',
        parameters=[
            swagger.String(
                name="studentId",
                param_type="path",
                description="Id of student details to edit",
                required=True
            )
        ],
        responses=[
            swagger.Message(200, "Ok"),
            swagger.Message(401, "Unauthorized"),
            swagger.Message(403, "Forbidden")
        ]
    )
    def post(self, studentId):
        """Create a new blobstore upload url.

        The student id is currently not used with this implementation.
        The student id should be sent with uploaded file.

        """
        user = self.get_current_user_data()

        if user is None or user.staff_id is None:
            self.admin_required()

        self.render_json({
            "url": blobstore.create_upload_url(config.UPLOAD_CB_URL)
        })


class HandlerMixin(object):

    def render_json(self, data, status_code=200):
        self.response.status = status_code
        self.response.headers['Content-Type'] = "application/json"
        self.response.out.write(json.dumps(data))


class UploadHandler(blobstore_handlers.BlobstoreUploadHandler, HandlerMixin):
    """Handle the call sent by the blobstore after a successful upload.

    """

    def post(self):
        self.response.headers['Content-Type'] = "application/json"

        current_user = users.get_current_user()
        if not current_user:
            self.render_json(
                {"error": "you need to be logged in to upload files."},
                401
            )
            return

        sender = User.get_by_id(current_user.user_id())

        if sender is None or sender.staff_id is None:
            if not users.is_current_user_admin():
                # self.render_json(
                #     {"error": "Only admin and staff can upload files."},
                #     403
                # )
                # return
                sender = None

        upload_files = self.get_uploads('file')
        blob_info = upload_files[0]
        dest_id = self.request.POST.get('destId')
        name = self.request.POST.get('name', blob_info.filename)
        doc_type = self.request.POST.get('docType')

        if not dest_id:
            self.render_json(
                {"error": 'No recipent was given.'},
                400
            )
            return

        if not doc_type:
            self.render_json(
                {"error": 'A document should have a typ.'},
                400
            )
            return

        try:
            new_file = models.File.new_file(
                dest_id, blob_info, doc_type, sender, name
            )
        except (ValueError, ValidationError,), e:
            self.render_json(
                {"error": "Failed to safe new file (%s)." % str(e)},
                400
            )
            return
        else:
            data = new_file.summary()
            data['url'] = webapp2.uri_for(
                'download_file', keyId=new_file.key.id()
            )
            self.render_json(data)


class DownloadHandler(blobstore_handlers.BlobstoreDownloadHandler, HandlerMixin):
    """Handle file download"""

    def get(self, keyId):
        keyId = str(urllib.unquote(keyId))

        current_user = users.get_current_user()
        if not current_user:
            self.error(401)
            return

        doc = models.File.get_by_id(keyId)
        viewer = User.get_by_id(current_user.user_id())
        if (viewer is None
            or viewer.staff_id is None
            or viewer.student_id  is None
            or viewer.student_id != doc.dest_ref.id()
        ):
            if not users.is_current_user_admin():
                # self.error(403)
                # everyone is admin
                pass

        blob_info = blobstore.BlobInfo.get(keyId)
        self.send_blob(blob_info)
