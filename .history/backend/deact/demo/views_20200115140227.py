from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view


# This will return a list of sessions
@api_view(["GET"])
def session(request):
    sessions = ["first session", "second session", "last session"]
    return Response(status=status.HTTP_200_OK, data={"data": sessions})