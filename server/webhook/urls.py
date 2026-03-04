from django.urls import include, path
from . import views

urlpatterns = [
    path("", views.receive_webhook, name="webhook"),
]