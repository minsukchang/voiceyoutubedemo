from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view


# This will return a list of sessions
@api_view(["GET"])
def session(request):
    sessions = ["ID1", "ID2", "ID3"]
    return Response(status=status.HTTP_200_OK, data={"data": sessions})

@api_view(["POST"])
def play(request):
    print('user plays the video')
    sessionID = request.data.get("sessionID")
    time_played = request.data.get("time")
    if sessionID is None or time is None:
        return Response({'error': 'Please provide both sessionID and time'},
                        status=HTTP_400_BAD_REQUEST)