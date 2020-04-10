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
from api.models import Session, Navigation
from api.serializers import SessionSerializer, NavigationSerializer
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np    
import spacy
from django.contrib.staticfiles.storage import staticfiles_storage
from django.templatetags.static import static
import os
# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_ROOT = os.path.join(BASE_DIR, 'static')



@api_view(["POST"])
@action(detail=True, methods=['post'], name='download subtitles')
def download_subtitles(request):
    video_id=request.data['video_id']
    out_filename = video_id+".json"
    URL = "https://downsub.com/?url=https://www.youtube.com/watch?v="+video_id
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    browser = webdriver.Chrome('/usr/bin/chromedriver', chrome_options=chrome_options)
    browser.get(URL)
    # driver = webdriver.PhantomJS()
    # driver.get(URL)
    # r = requests.get(URL)
    # html = r.text
    # soup = BeautifulSoup(html, 'html.parser')
    # print(html)
    # href = soup.find_all('a')[0].get('href')
    href = browser.find_element_by_name('a')
    return Response({'status': href})
    subtitle = requests.get("https://downsub.com/"+href)
    subtitle = parse_srt(subtitle.content.decode())
    open("../static/"+out_filename, 'w').write(json.dumps(subtitle, indent=2, sort_keys=True))
    return Response({'status': 'subtitle downloaded'})

@csrf_exempt
@api_view(["POST"])
def find_sentence(request):
    found = False
    transcript = ' '.join(request.data['transcript'])
    video_id=request.data['videoID']
    corpus = []
    corpus_time = []
    corpus.append(transcript)
    with open((os.path.join(STATIC_ROOT, video_id + '.json'))) as subtitle:
        sjson = subtitle.read()
        sjdata = json.loads(sjson)
        for line in sjdata:
            print(line)
            corpus.append(line['content'])
            corpus_time.append(line['start'])
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
    # print('most similar sentence is ', corpus[result_idx], arr[0])
    if result_idx != 1:
        found = True
    return Response({'time': corpus_time[result_idx-1], 'content': corpus[result_idx], 'found': found})




class SessionViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    `update`, and `destroy` actions.
    """
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    
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

    @action(detail=True, methods=['put'], name='add pause')
    def add_pause(self, request, pk=None):
        session = self.get_object()
        print('the request time data is ', request.data['time'])
        session.pauses.append(request.data['time'])
        session.save()
        return Response({'status': 'pause added'})

    @action(detail=True, methods=['put'], name='add bookmark')
    def add_bookmark(self, request, pk=None):
        session = self.get_object()
        print('the request time data is ', request.data['time'])
        session.bookmarks.append(request.data['time'])
        session.save()
        return Response({'status': 'bookmark added'})

    @action(detail=True, methods=['put'], name='add returnpoint')
    def add_returnpoint(self, request, pk=None):
        session = self.get_object()
        print('the request time data is ', request.data['time'])
        session.returnpoints.append(request.data['time'])
        session.save()
        return Response({'status': 'returnpoint added'})

    @action(detail=True, methods=['put'], name='add username')
    def add_username(self, request, pk=None):
        session = self.get_object()
        print('the username is ', request.data['username'])
        session.username = request.data['username']
        session.save()
        return Response({'status': 'username added'})



class NavigationViewSet(viewsets.ModelViewSet):

    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    `update`, and `destroy` actions.
    """
    queryset = Navigation.objects.all()
    serializer_class = NavigationSerializer

    def create(self, request, *args, **kwargs):
        print('here', request.data)
        session = request.data['sessionID']
        print('session is', session)
        session_instance = Session.objects.filter(id=session).first()
        print('session_instance is', session_instance)
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(serializer.errors)
        self.perform_create(serializer, session_instance)

        # serializer.save(Session = session_instance)
        # serializer.save()
        return Response(serializer.data, status=HTTP_200_OK)

    def perform_create(self, serializer, session_instance):
        serializer.save(session = session_instance)

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

    
    @action(detail=True, methods=['put'], name='add evaluation')
    def add_evaluation(self, request, pk=None):
        navigation = self.get_object()
        navigation.subtitle = request.data.get('subtitle')
        navigation.subtitle_time = request.data.get('subtitle_time')
        navigation.intended_time = request.data.get('intended_time')
        navigation.correct = request.data.get('correct')
        navigation.error_type = request.data.get('error_type')
        navigation.error_details = request.data.get('error_details')
        navigation.save()
        return Response({'status': 'transcript added'})


    # @action(detail=True, methods=['post'], name='add transcript')
    # def add_transcript(self, request, pk=None):
    #     navigation = self.get_object()
    #     navigation.transcript = request.data['transcript']
    #     navigation.transcript_time = request.data['time']
    #     navigation.save()
    #     return Response({'status': 'transcript added'})
