import time
from email import utils

from google.appengine.ext import ndb
from google.appengine.datastore.datastore_query import Cursor

from educationext.dashboard import api
from educationext.core.models import Student


class File(ndb.Model):

    data = ndb.JsonProperty()
    sender_ref = ndb.KeyProperty()
    dest_ref = ndb.KeyProperty(required=True)
    uploaded_at = ndb.DateTimeProperty(auto_now_add=True)

    def summary(self):
        data = self.data.copy()
        data['destId'] = self.dest_ref.id()

        uploaded_ts = time.mktime(self.uploaded_at.timetuple())
        data['uploadedAt'] = utils.formatdate(uploaded_ts)

        if self.sender_ref:
            data['senderId'] = self.sender_ref.id()

        return data

    @classmethod
    def new_file(cls, dest_id, blob_info, doc_type, sender=None, name=None):
        dest = Student.get_by_id(dest_id)
        if dest is None:
            raise ValueError("Couldn't find the student to send the file to.")

        data={
            'name': name if name else blob_info.filename,
            'type': doc_type,
            'sender': sender.full_name if sender else 'System',
            'dest': dest.full_name,
            'lastDownloadAt': ''
        }
        file = cls(
            id=str(blob_info.key()),
            data=data,
            sender_ref=sender.key if sender else None,
            dest_ref=dest.key
        )
        file.put()
        return file

    @classmethod
    def get_files(cls, student_key, cursor_key, **kw):
        cursor = Cursor(urlsafe=cursor_key) if cursor_key else None
        q = cls.query().filter(cls.dest_ref == student_key)
        q = q.order(-cls.uploaded_at)
        return q.fetch_page(20, cursor=cursor, **kw)

    @staticmethod
    def validate(data):
        api.validate('FileData', data)

    def _pre_put_hook(self):
        self.validate(self.data)
