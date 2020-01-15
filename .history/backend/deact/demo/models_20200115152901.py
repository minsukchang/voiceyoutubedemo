from django.db import models
fromm django import forms

# Create your models here.

class Transcript(model.Model):
    text = models.TextField()
    time = model.TimeField()

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
            model_container = Transcript
            model_form = TranscriptForm
        )
    )
    bookmarks = ArrayField(
        models.TimeField()
    )
