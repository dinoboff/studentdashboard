"""JSON/RESTful API that will support a variety of Angularjs apps to
support the education market in Singapore.

"""
from google.appengine.api import lib_config
from webapp2ext.swagger import Api

__all__ = ['api']


class _ConfigDefaults(object):
  HOST = "http://0.0.0.0:8080/"
  PATH = '/api/v1/'
  VERSION = '1-dev'

_config = lib_config.register('education_core',  _ConfigDefaults.__dict__)

# Put those settings in appengine_config.py
api = Api(host=_config.HOST, path=_config.PATH, version=_config.VERSION)


import educationext.core.schemas
import educationext.core.controllers
