from jsonschema import ValidationError
from google.appengine.api import users


from educationext.core.exceptions import ModelError, CannotRegisterError
from educationext.core.models import Student, Staff, User
from educationext.core.tests.utils import TestCase


class TestUser(TestCase):

    def test_new_staff_user(self):
        self.login(email='test@example.com')
        Staff.new_staff({
            'firstName': 'Alice',
            'lastName': 'Smith',
            'id': 'S2010200001',
            'email': 'test@example.com'
        }).key.get(use_cache=False)

        user = User.new_user(users.get_current_user())
        self.assertEqual('S2010200001', user.staff_id)
        self.assertEqual(None, user.student_id)
        self.assertEqual('Alice', user.first_name)
        self.assertEqual('Smith', user.last_name)
        self.assertEqual('test@example.com', user.email)
        self.assertEqual('Smith, Alice', user.full_name)
        self.assertEqual(None, user.photo)

    def test_new_student_user(self):
        self.login(email='test@example.com')
        Student.new_student({
            'firstName': 'Alice',
            'lastName': 'Smith',
            'id': 'X2010200001',
            'email': 'test@example.com'
        }).key.get(use_cache=False)

        user = User.new_user(users.get_current_user())
        self.assertEqual(None, user.staff_id)
        self.assertEqual('X2010200001', user.student_id)
        self.assertEqual('Alice', user.first_name)
        self.assertEqual('Smith', user.last_name)
        self.assertEqual('test@example.com', user.email)
        self.assertEqual('Smith, Alice', user.full_name)
        self.assertEqual(None, user.photo)

    def test_new_user_fail(self):
        self.login(email='test@example.com')
        self.assertRaises(
            CannotRegisterError, 
            User.new_user, 
            users.get_current_user()
        )


class TestStaff(TestCase):

    def test_new_staff(self):
        alice = Staff.new_staff({
            'firstName': 'Alice',
            'lastName': 'Smith',
            'id': 'S2010200001',
            'email': 'test@example.com'
        })
        self.assertEqual('S2010200001', alice.staff_id)
        self.assertEqual('S2010200001', alice.key.id())
        self.assertEqual('Alice', alice.first_name)
        self.assertEqual('Smith', alice.last_name)
        self.assertEqual('test@example.com', alice.email)
        self.assertEqual('Smith, Alice', alice.full_name)
        self.assertEqual(None, alice.photo)

    def test_new_staff_create_unique_staff(self):
        Staff.new_staff({
            'firstName': 'Alice',
            'lastName': 'Smith',
            'id': 'S2010200001',
            'email': 'test@example.com'
        })
        self.assertRaises(
            ModelError,
            Staff.new_staff,
            {
                'firstName': 'Bob',
                'lastName': 'Smith',
                'id': 'S2010200001', # same studentId
                'email': 'test@example.com'
            }
        )

        alice = Staff.get_by_id('S2010200001')
        self.assertEqual('Alice', alice.first_name)

    def test_validate_staff(self):
        self.assertEqual(
            None,
            Staff.validate(
                {
                    'firstName': 'Alice',
                    'lastName': 'Smith',
                    'id': 'S2010200001',
                    'email': 'test@example.com',
                    'photo': 'http://placehold.it/300x400&text=portrait'
                }
            )
        )
        self.assertRaises(
            ValidationError,
            Staff.validate,
            {
                'id': 'S2010200001'
            }
        )
        self.assertRaises(
            ValidationError,
            Staff.validate,
            {
                'firstName': 'Alice',
                'lastName': 'Smith',
            }
        )

    def test_update_staff(self):
        """the staff data stay valide"""
        Staff.new_staff({
            'firstName': 'Alice',
            'lastName': 'Smith',
            'id': 'S2010200001',
            'email': 'test@example.com'
        })
        alice = Staff.get_by_id('S2010200001')
        del alice.data['lastName']
        self.assertRaises(ValidationError, alice.put)

    def test_id_is_immutable(self):
        """The staff staffId cannot be edited"""
        Staff.new_staff({
            'firstName': 'Alice',
            'lastName': 'Smith',
            'id': 'S2010200001',
            'email': 'test@example.com'
        })
        alice = Staff.get_by_id('S2010200001')
        alice.data['id'] += '1'
        self.assertRaises(ModelError, alice.put)

    def test_names_are_capitalized(self):
        alice = Staff.new_staff({
            'firstName': 'alice',
            'lastName': 'smith',
            'id': 'S2010200001',
            'email': 'test@example.com'
        })
        self.assertEqual('Alice', alice.first_name)
        self.assertEqual('Smith', alice.last_name)

        alice = Staff.get_by_id('S2010200001')
        alice.data['lastName'] = 'taylor'
        alice.put()
        self.assertEqual('Taylor', alice.last_name)


class TestStudent(TestCase):

    def test_new_student(self):
        alice = Student.new_student({
            'firstName': 'Alice',
            'lastName': 'Smith',
            'id': 'X2010200001',
            'email': 'test@example.com'
        })
        self.assertEqual('X2010200001', alice.student_id)
        self.assertEqual('X2010200001', alice.key.id())
        self.assertEqual('Alice', alice.first_name)
        self.assertEqual('Smith', alice.last_name)
        self.assertEqual('test@example.com', alice.email)
        self.assertEqual('Smith, Alice', alice.full_name)
        self.assertEqual(None, alice.photo)

        alice = Student.get_by_id('X2010200001')
        self.assertTrue(alice)

    def test_new_student_create_unique_student(self):
        Student.new_student({
            'firstName': 'Alice',
            'lastName': 'Smith',
            'id': 'X2010200001',
            'email': 'test@example.com'
        })
        self.assertRaises(
            ModelError,
            Student.new_student,
            {
                'firstName': 'Bob',
                'lastName': 'Smith',
                'id': 'X2010200001', # same studentId
                'email': 'test@example.com'
            }
        )

        alice = Student.get_by_id('X2010200001')
        self.assertEqual('Alice', alice.first_name)

    def test_validate_student(self):
        self.assertEqual(
            None,
            Student.validate(
                {
                    'firstName': 'Alice',
                    'lastName': 'Smith',
                    'id': 'X2010200001',
                    'email': 'test@example.com',
                    'photo': 'http://placehold.it/300x400&text=portrait'
                }
            )
        )
        self.assertRaises(
            ValidationError,
            Student.validate,
            {
                'id': 'X2010200001'
            }
        )
        self.assertRaises(
            ValidationError,
            Student.validate,
            {
                'firstName': 'Alice',
                'lastName': 'Smith',
            }
        )

    def test_update_student(self):
        """the student data stay valide"""
        Student.new_student({
            'firstName': 'Alice',
            'lastName': 'Smith',
            'id': 'X2010200001',
            'email': 'test@example.com'
        })
        alice = Student.get_by_id('X2010200001')
        del alice.data['lastName']
        self.assertRaises(ValidationError, alice.put)

    def test_id_is_immutable(self):
        """The student studentId cannot be edited"""
        Student.new_student({
            'firstName': 'Alice',
            'lastName': 'Smith',
            'id': 'X2010200001',
            'email': 'test@example.com'
        })
        alice = Student.get_by_id('X2010200001')
        alice.data['id'] += '1'
        self.assertRaises(ModelError, alice.put)

    def test_names_are_capitalized(self):
        alice = Student.new_student({
            'firstName': 'alice',
            'lastName': 'smith',
            'id': 'X2010200001',
            'email': 'test@example.com'
        })
        self.assertEqual('Alice', alice.first_name)
        self.assertEqual('Smith', alice.last_name)

        alice = Student.get_by_id('X2010200001')
        alice.data['lastName'] = 'taylor'
        alice.put()
        self.assertEqual('Taylor', alice.last_name)
