from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_200_OK
)
from rest_framework.decorators import action

from demo.models import Session 
from demo.serializers import SessionSerializer

# This will return a list of sessions
@api_view(["GET"])
def session(request):
    sessions = ["ID1", "ID2", "ID3"]
    return Response(status=status.HTTP_200_OK, data={"data": sessions})


class SessionViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    `update`, and `destroy` actions.
    """
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    # permission_classes = (AnonCreateAndUpdateOwnerOnly, ListAdminOnly,)
    # lookup_field = 'sessionID'

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)      

#is this needed
    @action(detail=True, methods=['post'], name='add pause')
    def add_pause(self, request, pk=None):
        session = self.get_object()
        print('the request time data is ', request.data['time'])
        session.pauses.append(request.data['time'])
        # session.add_pause(request.data['time'])
        session.save()
        return Response({'status': 'pause added'})