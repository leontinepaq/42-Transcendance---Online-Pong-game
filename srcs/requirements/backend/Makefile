VENV_D =		./venv/
ACTIVATE_F =	$(VENV_D)/bin/activate
REQ_F =			./requirements.txt

SHELL :=	/bin/zsh
.ONESHELL:

$(VENV_D):
						virtualenv $(VENV_D)

update-requirements:	$(VENV_D)
						source $(ACTIVATE_F) && pip freeze > ./requirements.txt && deactivate
