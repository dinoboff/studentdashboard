"""Test controllers for common task

"""
import unittest

from google.appengine.api import users
from google.appengine.ext import ndb

from educationext.core import api
from educationext.core.models import Student, User, Staff
from educationext.core.tests.utils import TestCase


class TestStudentListApi(TestCase):
    """Test for StudentApi request handler.

    """
    def setUp(self):
        super(TestStudentListApi, self).setUp()

        self.alice = Student.new_student({
            'firstName': 'Alice',
            'lastName': 'Smith',
            'id': 'X2010200001',
            'email': 'test@example.com'
        })
        # make sure data will be visible in next query
        ndb.get_multi(
            [
                self.alice.key
            ],
            use_cache=False
        )

    def test_student_list_logged_off(self):
        response = self.app.get('%s/students' % api.path, status=401)
        self.assertIn("error", response.json)

    @unittest.skip("Everyone is admin")
    def test_student_list_logged_as_user(self):
        self.login()
        response = self.app.get('%s/students' % api.path, status=403)
        self.assertIn("error", response.json)

    def test_student_list(self):
        """Should list students"""
        self.login(is_admin=True)
        response = self.app.get('%s/students' % api.path)
        self.assertIn('cursor', response.json)
        self.assertIn('students', response.json)
        self.assertEqual(
            response.json.get('students'),
            [
                {
                    'firstName': 'Alice',
                    'lastName': 'Smith',
                    'id': 'X2010200001',
                }
            ]
        )

    def test_student_list_with_cursor(self):
        """Should list students using the cursor for a previous request

        """
        self.login(is_admin=True)
        response = self.app.get('%s/students' % api.path)

        # might be empty in production
        self.assertTrue(response.json.get('cursor'))
        response = self.app.get(
            '%s/students' % api.path,
            {'cursor': response.json.get('cursor')}
        )
        self.assertIn('cursor', response.json)
        self.assertIn('students', response.json)
        self.assertEqual(response.json.get('students'), [])

    def test_add_student_logged_off(self):
        response = self.app.post_json(
            '%s/students' % api.path,
            {
                'firstName': 'Bob',
                'lastName':  'Taylor',
                'id': 'X2010200002',
                'email': 'test@example.com',
                'photo': 'http://placehold.it/300x400&text=portrait'
            },
            status=401
        )
        self.assertIn("error", response.json)

    @unittest.skip("Everyone is admin")
    def test_add_student_logged_as_user(self):
        self.login(is_admin=False)
        response = self.app.post_json(
            '%s/students' % api.path,
            {
                'firstName': 'Bob',
                'lastName':  'Taylor',
                'id': 'X2010200002',
                'email': 'test@example.com',
                'photo': 'http://placehold.it/300x400&text=portrait'
            },
            status=403
        )
        self.assertIn("error", response.json)

    def test_add_student(self):
        self.login(is_admin=True)
        response = self.app.post_json(
            '%s/students' % api.path,
            {
                'firstName': 'Bob',
                'lastName':  'Taylor',
                'id': 'X2010200002',
                'email': 'test@example.com',
                'photo': 'http://placehold.it/300x400&text=portrait'
            }

        )
        self.assertEqual(
            {
                'firstName': 'Bob',
                'lastName':  'Taylor',
                'id': 'X2010200002',
                'photo': 'http://placehold.it/300x400&text=portrait'
            },
            response.json
        )

    def test_add_student_fails(self):
        self.login(is_admin=True)
        response = self.app.post_json(
            '%s/students' % api.path,
            {
                'id': 'X2010200002',
                'photo': 'http://placehold.it/300x400&text=portrait'
            },
            status=400
        )
        self.assertIn('error', response.json)

        response = self.app.post_json(
            '%s/students' % api.path,
            {
                'firstName': 'Bob',
                'lastName':  'Taylor',
                'photo': 'http://placehold.it/300x400&text=portrait'
            },
            status=400
        )
        self.assertIn('error', response.json)


class TestStaffListApi(TestCase):
    """Test for StaffApi request handler.

    """
    def setUp(self):
        super(TestStaffListApi, self).setUp()

        self.alice = Staff.new_staff({
            'firstName': 'Alice',
            'lastName': 'Smith',
            'id': 'X2010200001',
            'email': 'test@example.com'
        })
        # make sure data will be visible in next query
        ndb.get_multi(
            [
                self.alice.key
            ],
            use_cache=False
        )

    def test_staff_list_logged_off(self):
        response = self.app.get('%s/staff' % api.path, status=401)
        self.assertIn("error", response.json)

    @unittest.skip("Everyone is admin")
    def test_staff_list_logged_as_user(self):
        self.login()
        response = self.app.get('%s/staff' % api.path, status=403)
        self.assertIn("error", response.json)

    def test_staff_list(self):
        """Should list staff"""
        self.login(is_admin=True)
        response = self.app.get('%s/staff' % api.path)
        self.assertIn('cursor', response.json)
        self.assertIn('staff', response.json)
        self.assertEqual(
            response.json.get('staff'),
            [
                {
                    'firstName': 'Alice',
                    'lastName': 'Smith',
                    'id': 'X2010200001',
                }
            ]
        )

    def test_staff_list_with_cursor(self):
        """Should list staff using the cursor for a previous request

        """
        self.login(is_admin=True)
        response = self.app.get('%s/staff' % api.path)

        # might be empty in production
        self.assertTrue(response.json.get('cursor'))
        response = self.app.get(
            '%s/staff' % api.path,
            {'cursor': response.json.get('cursor')}
        )
        self.assertIn('cursor', response.json)
        self.assertIn('staff', response.json)
        self.assertEqual(response.json.get('staff'), [])

    def test_add_staff_logged_off(self):
        response = self.app.post_json(
            '%s/staff' % api.path,
            {
                'firstName': 'Bob',
                'lastName':  'Taylor',
                'id': 'X2010200002',
                'email': 'test@example.com',
                'photo': 'http://placehold.it/300x400&text=portrait'
            },
            status=401
        )
        self.assertIn("error", response.json)

    @unittest.skip("Everyone is admin")
    def test_add_staff_logged_as_user(self):
        self.login(is_admin=False)
        response = self.app.post_json(
            '%s/staff' % api.path,
            {
                'firstName': 'Bob',
                'lastName':  'Taylor',
                'id': 'X2010200002',
                'email': 'test@example.com',
                'photo': 'http://placehold.it/300x400&text=portrait'
            },
            status=403
        )
        self.assertIn("error", response.json)

    def test_add_staff(self):
        self.login(is_admin=True)
        response = self.app.post_json(
            '%s/staff' % api.path,
            {
                'firstName': 'Bob',
                'lastName':  'Taylor',
                'id': 'X2010200002',
                'email': 'test@example.com',
                'photo': 'http://placehold.it/300x400&text=portrait'
            }

        )
        self.assertEqual(
            {
                'firstName': 'Bob',
                'lastName':  'Taylor',
                'id': 'X2010200002',
                'photo': 'http://placehold.it/300x400&text=portrait'
            },
            response.json
        )

    def test_add_staff_fails(self):
        self.login(is_admin=True)
        response = self.app.post_json(
            '%s/staff' % api.path,
            {
                'id': 'X2010200002',
                'photo': 'http://placehold.it/300x400&text=portrait'
            },
            status=400
        )
        self.assertIn('error', response.json)

        response = self.app.post_json(
            '%s/students' % api.path,
            {
                'firstName': 'Bob',
                'lastName':  'Taylor',
                'photo': 'http://placehold.it/300x400&text=portrait'
            },
            status=400
        )
        self.assertIn('error', response.json)


class TestStudentApi(TestCase):

    def setUp(self):
        super(TestStudentApi, self).setUp()

        self.alice = Student.new_student({
            'firstName': 'Alice',
            'lastName': 'Smith',
            'id': 'X2010200001',
            'email': 'test@example.com'
        })
        # make sure data will be visible in next query
        ndb.get_multi(
            [
                self.alice.key
            ],
            use_cache=False
        )

    def test_edit_student(self):
        self.login(is_admin=True)
        self.app.put_json(
            '%s/students/%s' % (api.path, self.alice.student_id),
            {"email": "foo@example.com"}
        )
        self.assertEqual(
            "foo@example.com",
            self.alice.key.get(use_cache=False).email
        )

    def test_edit_student_and_user(self):
        self.login(is_admin=True, email="test@example.com")
        alice_user = User.new_user(users.get_current_user())
        alice_user.key.get(use_cache=False)

        self.app.put_json(
            '%s/students/%s' % (api.path, self.alice.student_id),
            {"email": "foo@example.com"}
        )
        self.assertEqual(
            "foo@example.com",
            alice_user.key.get(use_cache=False).email
        )

    def test_edit_student_logged_off(self):
        self.app.put_json(
            '%s/students/%s' % (api.path, self.alice.student_id),
            {"email": "foo@example.com"},
            status=401
        )

    @unittest.skip("everyone is admin")
    def test_edit_student_logged_as_user(self):
        self.login(is_admin=False)
        self.app.put_json(
            '%s/students/%s' % (api.path, self.alice.student_id),
            {"email": "foo@example.com"},
            status=401
        )

    def test_edit_student_id(self):
        self.login(is_admin=True)
        self.app.put_json(
            '%s/students/%s' % (api.path, self.alice.student_id),
            {"studentId": "x2"},
            status=400
        )


class TestUserApi(TestCase):

    def test_user_logged_off(self):
        response = self.app.get('%s/user' % api.path, status=401)
        self.assertIn('error', response.json)
        self.assertIn('loginUrl', response.json)

    def test_user_logged_in_as_admin(self):
        self.login(is_admin=True)
        response = self.app.get('%s/user' % api.path)
        self.assertIn('logoutUrl', response.json)
        self.assertEqual('test@example.com', response.json['name'])
        self.assertEqual(True, response.json['isAdmin'])

    @unittest.skip("everybody is admin while we test")
    def test_user_logged_in(self):
        self.login(is_admin=False)
        response = self.app.get('%s/user' % api.path)
        self.assertEqual(False, response.json['isAdmin'])
