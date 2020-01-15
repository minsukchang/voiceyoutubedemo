from django.db import models
from django import forms

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
    plays = models.ArrayField(
        models.TimeField()
    )
    pauses = models.ArrayField(
        models.TimeField()
    )
    transcripts = models.ArrayField(
        models.ArrayField(
            model_container = Transcript,
            model_form_class = TranscriptForm
        )
    )
    bookmarks = models.ArrayField(
        models.TimeField()
    )
