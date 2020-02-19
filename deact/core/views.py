from django.shortcuts import render

# Create your views here.

def index(request):
    return render(request, "build/index.html")

def instructions(request):
    return render(request, "build/instructions.html")