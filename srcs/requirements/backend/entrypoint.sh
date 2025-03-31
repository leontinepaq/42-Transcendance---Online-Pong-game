#!/bin/bash

# todo @leontinepaq a changer je pense
# Définir le dossier media et avatars
MEDIA_DIR="/media"
AVATAR_DIR="$MEDIA_DIR/avatars"

# Créer le dossier avatars s'il n'existe pas
mkdir -p "$AVATAR_DIR"

# Copier les avatars par défaut si absents
if [ ! -f "$AVATAR_DIR/default_avatar.png" ]; then
    cp /apps/static/default_avatar.png "$AVATAR_DIR/default_avatar.png"
fi

if [ ! -f "$AVATAR_DIR/ai_avatar.png" ]; then
    cp /apps/static/ai_avatar.png "$AVATAR_DIR/ai_avatar.png"
fi

python /apps/manage.py makemigrations
python /apps/manage.py migrate
python /apps/manage.py runserver 0.0.0.0:8000