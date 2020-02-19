import re
from rest_framework import serializers
from api.models import Session

class SessionSerializer(serializers.ModelSerializer):
    """Serializes Session models."""
    # sessionID = serializers.CharField()
    

    class Meta:
        model = Session
        # fields = ('sessionID', 'pauses', 'transcripts', 'transcript_times', 'bookmarks')

        fields = '__all__'