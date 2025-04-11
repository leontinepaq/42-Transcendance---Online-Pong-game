from django.urls import path
from .views import (create,
					display_available,
					display_registered,
					display_ongoing,
					display_history,
					register,
					unregister
					)

urlpatterns = [
    path("create/", create),
	path("display_available/", display_available),
	path("display_registered/", display_registered),
	path("display_ongoing/", display_ongoing),
	path("display_history/", display_history),
	path("register/", register),
	path("unregister/", unregister)
]
