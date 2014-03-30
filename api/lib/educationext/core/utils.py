from google.appengine.api import users
from webapp2ext import swagger

from educationext.core import models
from educationext.core import exceptions


class ApiRequestHandler(swagger.ApiRequestHandler):
    """Extends the base request handler to handle authentication

    """

    @classmethod
    def get_current_user_data(cls):
        """Return the student or staff for the current logged in user.

        Return None is the user is not logged in, neither a student or
        staff or is an admin.

        """
        guser = cls.get_current_user()
        if not guser:
            return

        user = models.User.get_by_id(guser.user_id())
        if user is None:
            try:
                user = models.User.new_user(guser)
            except exceptions.CannotRegisterError:
                return

        if guser.email() != user.email:
            user.update_details({'email': guser.email()})
            return user.key.get()
        else:
            return user

    def student_required(self):
        """Abort the request if the user is not a student

        """
        self.login_required()

        user = self.get_current_user_data()
        if not user or not user.student_id:
            self.abort(403)
        else:
            return user

    def staff_required(self):
        """Abort the request if the user is not a staff mumber or
        an admin.

        """
        self.login_required()
        if users.is_current_user_admin():
            return

        user = self.get_current_user_data()
        if not user or not user.staff_id:
            self.abort(403)
        else:
            return user
