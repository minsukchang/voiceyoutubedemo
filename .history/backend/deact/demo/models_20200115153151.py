from django.db import models
from django import forms
from django.contrib.postgres.fields import ArrayField

# Create your models here.

class Transcript(models.Model):
    text = models.TextField()
    time = models.TimeField()

    class Meta:
        abstract = True

class TranscriptForm(forms.ModelForm):
    class Meta:
        model = Transcript
        fields = (
            'text', 'time'
        )

class Session(models.Model):
    sessionID = models.TextField()
    plays = ArrayField(
        models.TimeField()
    )
    pauses = ArrayField(
        models.TimeField()
    )
    transcripts = ArrayField(
        ArrayField(
            model_container = Transcript,
            model_form_class = TranscriptForm
        )
    )
    bookmarks = ArrayField(
        models.TimeField()
    )
