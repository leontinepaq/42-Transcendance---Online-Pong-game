from django.urls import path
from .views import (create,
					display_available,
					display_registered,
					register,
					unregister
					)

urlpatterns = [
    path("create/", create),
	path("display_available/", display_available),
	path("display_registered/", display_registered),
	path("register/", register),
	path("unregister/", unregister)
]
