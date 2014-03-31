from educationext.dashboard import api
from webapp2ext.swagger import String, Array



api.schema(
    'File',
    description="A private file.",
    properties={
        "name": String(required=True),
        "url": String(required=True),
        "sender": String(required=True),
        "senderId": String(required=True),
        "dest": String(required=True),
        "destId": String(required=True),
        "uploadedAt": String(required=True),
        "lastDownloadAt": String()
    }
)

api.schema(
    'FileData',
    properties={
        "name": String(required=True),
        "sender": String(required=True),
        "dest": String(required=True),
        "lastDownloadAt": String()
    }
)

api.schema(
    'FileList',
    properties={
        'cursor': String(),
        'files': Array(items='File', required=True)
    }
)