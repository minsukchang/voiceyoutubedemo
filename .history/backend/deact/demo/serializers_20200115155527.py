import re
from rest_framework import serializers
from demo.models import Session

class SessionSerializer(serializers.ModelSerializer):
    """Serializes Session models."""
   