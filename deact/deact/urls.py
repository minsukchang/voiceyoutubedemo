"""deact URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from api.views import SessionViewSet, NavigationViewSet, download_subtitles, find_sentence
from core.views import index, instructions
from rest_framework.routers import DefaultRouter

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register('sessions', SessionViewSet)
router.register('navigations', NavigationViewSet)

urlpatterns = [
    path('', instructions, name="instructions"),
    path('demo', index, name="index"),
    path('backend/', include(router.urls)),
    # path('backend/', include(navigation_router.urls)),
    path('admin/', admin.site.urls),
    path('download_subtitles/', download_subtitles, name="download subtitles"),
    path('find_sentence/', find_sentence)
]
