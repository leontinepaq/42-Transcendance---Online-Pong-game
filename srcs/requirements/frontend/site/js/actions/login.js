export const loginActions = [
	{
		selector:	'[data-action="signin"]',
handle	:	handleSignin
	},
	{
		selector:	'[data-action="forgot-pwd"]',
handle	:	handleForgotPwd
	}
];

async function login(username, password)
{
	 try {
		const response = await fetch('/api/user/login/', {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password })
		});
		const data = await response.json();
		console.log(data.message);
		return {
			ok: response.ok,
			message: data.message,
			...data
		 };
	 } catch (error) {
		 console.error('Login error:', error);
		 throw error;
	 }
}

async function handleSignin(element, event)
{
	console.log("{login.js} sign-in button clicked", element);

	const form = element.closest("form");
	if (!form.checkValidity()) {
		form.reportValidity();
		return;
	}

	const username = document.getElementById('username').value;
	const password = document.getElementById('password').value;

	try {
		const data = await login(username, password);
		sessionStorage.setItem("username", username);
		if (data.ok)
			navigate('2fa');
		else
			alert(data.message || 'Login failed');
	}
	catch (error) {
		console.error('Login error:', error);
		alert('An error occurred. Please try again.');
	}
}

// todo @samihelal / @leontinepaq  => surement un lien vers une autre page donc pas gere ici mais a faire
async function handleForgotPwd(element, event)
{
	console.log("{login.js} forgot password button clicked", element);
}


// todo @leontinepaq: changer les alert c'est trop moche

//OLD todo @leontinepaq a supprimer
// import observeAndAttachEvent from '../observeAndAttachEvent__obsolete.js'

// async function login(username, password)
// {
//	 try {
//		 const response = await fetch('/api/user/login/', {
//			 method: 'POST',
//			 credentials: 'include',
//			 body: JSON.stringify({ username, password }),
//		 });
//		 const data = await response.json();
//		 console.log(data.message);
//		 return {
//			 ok: response.ok,
//			 message: data.message,
//			 ...data
//		 };
//	 } catch (error) {
//		 console.error('Login error:', error);
//		 throw error;
//	 }
// }


// observeAndAttachEvent(
//	 'login-form',
//	 'submit',
//	 async (event) => {
//		 console.log("login try");
//		 event.preventDefault();
//		 const username = document.getElementById('username').value;
//		 const password = document.getElementById('password').value;

//		 try {
//			 const data = await login(username, password);
//			 sessionStorage.setItem("username", username);
//			 if (data.ok)
//				 navigate('2fa');
//			 else
//				 alert(data.message || 'Login failed');
//		 } catch (error) {
//			 console.error('Login error:', error);
//			 alert('An error occurred. Please try again.');
//		 }
//	 }
// );

// observeAndAttachEvent(
//	 'signup-btn',
//	 'click',
//	 () => navigate('signup')
// );

// observeAndAttachEvent(
//	 'pong',
//	 'click',
//	 () => navigate('pong')
// );