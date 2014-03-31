from google.appengine.ext import ndb
from google.appengine.datastore.datastore_query import Cursor

from educationext.dashboard import api, config
from educationext.core.models import Student


class File(ndb.Model):

    data = ndb.JsonProperty()
    sender_ref = ndb.KeyProperty(required=True)
    dest_ref = ndb.KeyProperty(required=True)
    uploaded_at = ndb.DateTimeProperty(auto_now_add=True)

    def summary(self):
        data = self.data.copy()
        data['senderId'] = self.sender_ref.id()
        data['destId'] = self.sender_ref.id()
        data['url'] = self.url_for(self)
        data['uploadedAt'] = self.uploaded_at
        return data

    @classmethod
    def new_file(cls, sender, dest_id, blob_info, name=None):
        dest = Student.get_by_id(dest_id)
        data={
            'name': name if name else blob_info.filename,
            'sender': sender.full_name,
            'dest': dest.full_name,
            'lastDownloadAt': None
        }
        file = cls(
            id=str(blob_info.key()),
            data=data,
            sender_ref=sender.key(),
            dest_ref=dest.key()
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
    def url_for(file):
        return '%s/repository/files/%s' % (config.PATH, file.key.id(),)

    @staticmethod
    def validate(data):
        api.validate('FileData')

    def _pre_put_hook(self):
        self.validate(self.data)
