from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django import forms
from .models import UserProfile

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField()
    password2 = forms.CharField(label="Confirm password", widget=forms.PasswordInput)

    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'password1', 'password2']

    def clean_password2(self):
        password1 = self.cleaned_data.get('password1')
        password2 = self.cleaned_data.get('password2')
        if password1 != password2:
            raise forms.ValidationError("Passwords don't match.")
        return password2

class UserProfileForm(forms.ModelForm):
	class Meta:
		model = UserProfile
		fields = ['username', 'email']


#Add power up, attacks, maps, etc...
#customize shortcuts
class Customization(forms.ModelForm):
	class Meta:
		model = UserProfile
		fields = ['avatar_url', 'theme']


# #do we need this shit ? See with Leon
# class AISettingsForm(forms.ModelForm):
# 	class Meta:
# 		model = UserProfile
# 		fields = ['ai_difficulty']