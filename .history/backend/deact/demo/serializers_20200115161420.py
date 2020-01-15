import re
from rest_framework import serializers
from demo.models import Session

class SessionSerializer(serializers.ModelSerializer):
    """Serializes Session models."""

    class Meta:
        model = Session
        fields = ('sessionID', 'pauses', 'transcripts', 'transcript_times', 'bookmarks')