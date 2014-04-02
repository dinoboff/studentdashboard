"""Education's exception

"""


class EducationError(Exception):
    """Generic and base exception for the education package"""


class InvalidOperation(EducationError):
    def __init__(self, value):
        self.value = value
    def __str__(self):
        return repr(self.value)


class ModelError(EducationError):
    """Generic error related to the eduction models modules"""


class CannotRegisterError(ModelError):
	"""Raise if user cannot be registered because there's no staff or
	student record for the user email.

	"""


class ValidationError(ModelError):
	"""Schema validation error."""


class DuplicateEntityError(ModelError):
	"""An entity with same id already exist"""
