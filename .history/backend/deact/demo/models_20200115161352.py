from django.db import models
from django import forms
from django.contrib.postgres.fields import ArrayField

# Create your models here.

class Session(models.Model):
    sessionID = models.TextField()
    pauses = ArrayField(
        models.TimeField()
    )
    transcripts = ArrayField(
        ArrayField(
            models.TextField()
        )
    )
    transcript_times = ArrayField(
        ArrayField(
            models.TimeField()
        )
    )
    bookmarks = ArrayField(
        models.TimeField()
    )
