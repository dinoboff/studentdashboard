from google.appengine.api import lib_config
from webapp2ext.swagger import Api

__all__ = ['api', 'config']


class _ConfigDefaults(object):
  HOST = "http://0.0.0.0:8080/"
  PATH = '/api/v1/dashboard'
  VERSION = '1-dev'
  UPLOAD_CB_URL = '/api/v1/_admin/dashboard/upload'
  DOWNLOAD_URL = '/api/v1/dashboard/repository/files/<keyId>'

config = lib_config.register('education_dashboard',  _ConfigDefaults.__dict__)

# Put those settings in appengine_config.py
api = Api(host=config.HOST, path=config.PATH, version=config.VERSION)


import educationext.dashboard.schemas
import educationext.dashboard.controllers
