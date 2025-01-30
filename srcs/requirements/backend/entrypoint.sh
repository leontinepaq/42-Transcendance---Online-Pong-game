#!/bin/bash
python /apps/manage.py migrate
python /apps/manage.py runserver 0.0.0.0:8000