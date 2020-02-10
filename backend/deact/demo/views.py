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
from django.views.decorators.csrf import csrf_exempt
from bs4 import BeautifulSoup
import requests, json, os
from demo.models import Session 
from demo.serializers import SessionSerializer
from selenium import webdriver
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np    
import spacy



@api_view(["GET"])
@action(detail=True, methods=['get'], name='download subtitles')
def download_subtitles(request):
    video_id="6aVOjLuw-Qg"
    out_filename = video_id+".json"
    if not os.path.isfile('./static/subtitle/'+out_filename):
        URL = "https://downsub.com/?url=https://www.youtube.com/watch?v="+video_id
        browser = webdriver.Chrome('/usr/local/bin/chromedriver')
        browser.get(URL)
        soup = BeautifulSoup(html, 'html.parser')
        soup.select('div#show a')[0].get('href')
        # href = soup.select('div#show a')[0].get('href')
        # subtitle = requests.get("https://downsub.com/"+href)
        # subtitle = parse_srt(subtitle.content.decode())
        subtitle = soup
        # open("../../demo/server/static/subtitle/"+out_filename, 'w').write(json.dumps(subtitle, indent=2, sort_keys=True))
    return Response({'status': 'subtitle downloaded'})

@csrf_exempt
@api_view(["POST"])
def find_sentence(request):
    found = False
    transcript = ' '.join(request.data['transcript'])
    print('given transcript is ', transcript)
    video_id="6aVOjLuw-Qg"
    corpus = []
    corpus_time = []
    corpus.append(transcript)
    with open('../../demo/src/'+video_id+'.json') as subtitle:
        sjson = subtitle.read()
        sjdata = json.loads(sjson)
        for line in sjdata:
            # print(line)
            corpus.append(line['content'])
            corpus_time.append(line['start'])
    print(corpus)
    #lemmatization using spacy
    nlp = spacy.load('en', disable=['parser', 'ner'])
    for i,sentence in enumerate(corpus):
        doc = nlp(sentence)
        corpus[i] = " ".join(token.lemma_ for token in doc)
    print(corpus)
    vect = TfidfVectorizer(min_df=1, stop_words="english")  
    tfidf = vect.fit_transform(corpus)   
    pairwise_similarity = tfidf * tfidf.T
    arr = pairwise_similarity.toarray()   
    np.fill_diagonal(arr, np.nan)     
    result_idx = np.nanargmax(arr[0])    
    print('most similar sentence is ', corpus[result_idx], arr)
    if result_idx != 1:
        found = True
    return Response({'time': corpus_time[result_idx-1], 'found': found})

class SessionViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    `update`, and `destroy` actions.
    """
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    # lookup_field = 'sessionID'#?
    # permission_classes = (AnonCreateAndUpdateOwnerOnly, ListAdminOnly,)
    # lookup_field = 'sessionID'

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=HTTP_200_OK)

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

    @action(detail=True, methods=['post'], name='add pause')
    def add_pause(self, request, pk=None):
        session = self.get_object()
        print('the request time data is ', request.data['time'])
        session.pauses.append(request.data['time'])
        session.save()
        return Response({'status': 'pause added'})

    @action(detail=True, methods=['post'], name='add bookmark')
    def add_bookmark(self, request, pk=None):
        session = self.get_object()
        print('the request time data is ', request.data['time'])
        session.bookmarks.append(request.data['time'])
        session.save()
        return Response({'status': 'bookmark added'})

    @action(detail=True, methods=['post'], name='add transcript')
    def add_transcript(self, request, pk=None):
        session = self.get_object()
        print('the request time data is ', request.data['time'])
        session.transcripts.append(request.data['transcript'])
        session.transcript_times.append(request.data['time'])
        session.save()
        return Response({'status': 'transcript added'})

    @action(detail=True, methods=['post'], name='add returnpoint')
    def add_returnpoint(self, request, pk=None):
        session = self.get_object()
        print('the request time data is ', request.data['time'])
        session.returnpoints.append(request.data['time'])
        session.save()
        return Response({'status': 'returnpoint added'})

    