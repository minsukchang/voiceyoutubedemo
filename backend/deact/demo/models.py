from django.db import models
from django import forms
from django.contrib.postgres.fields import ArrayField

# Create your models here.

class Session(models.Model):
    # sessionID = models.IntegerField(primary_key=True, blank=False)
    pauses = ArrayField(
        models.TimeField(blank=True),
        null=True,
        blank=True,
    )
    bookmarks = ArrayField(
        models.TimeField(blank=True),
        null=True,
        blank=True,
    )
    transcripts = ArrayField(
        models.TextField(blank=True),
        null=True,
        blank=True
    )
    transcript_times = ArrayField(
        models.TimeField(blank=True),
        null=True,
        blank=True
    )
    
