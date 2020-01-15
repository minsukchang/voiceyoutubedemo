from django.db import models
from django import forms
from django.contrib.postgres.fields import ArrayField

# Create your models here.

class Session(models.Model):
    sessionID = models.TextField()
    pauses = ArrayField(
        models.TimeField(required=False)
    )
    transcripts = ArrayField(
        ArrayField(
            models.TextField(required=False)
        )
    )
    transcript_times = ArrayField(
        ArrayField(
            models.TimeField(required=False)
        )
    )
    bookmarks = ArrayField(
        models.TimeField(required=False)
    )
