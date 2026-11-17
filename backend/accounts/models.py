from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True)
    currency = models.CharField(max_length=3, default='INR')
    avatar = models.CharField(max_length=255, blank=True, default='')

    # Make email required and unique
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username
