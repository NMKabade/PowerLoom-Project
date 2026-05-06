from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class UserRoleTestCase(TestCase):
    def test_create_admin_user(self):
        admin = User.objects.create_user(username='admin_test', password='password', role='ADMIN')
        self.assertEqual(admin.role, 'ADMIN')
        self.assertTrue(admin.check_password('password'))

    def test_create_jober_user(self):
        jober = User.objects.create_user(username='jober_test', password='password', role='JOBER')
        self.assertEqual(jober.role, 'JOBER')
        self.assertTrue(jober.check_password('password'))
