import re
from rest_framework import serializers
from ttsapi.models import Session

class SessionSerializer(serializers.ModelSerializer):
    """Serializes Session models."""
   