#!/bin/bash

# Copy default avatars
AVATAR_DIR="/media/avatars"
mkdir -p "$AVATAR_DIR"
if [ ! -f "$AVATAR_DIR/default_avatar.png" ]; then
    cp /apps/static/default_avatar.png "$AVATAR_DIR/default_avatar.png"
fi
if [ ! -f "$AVATAR_DIR/ai_avatar.png" ]; then
    cp /apps/static/ai_avatar.png "$AVATAR_DIR/ai_avatar.png"
fi

python /apps/manage.py makemigrations
python /apps/manage.py migrate
python /apps/manage.py runserver 0.0.0.0:8000