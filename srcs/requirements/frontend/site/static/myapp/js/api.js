const api = {
    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        return parts.length === 2 ? parts.pop().split(';').shift() : null;
    },

    async login(username, password) {
        try {
            const response = await fetch('/api/auth/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCookie('csrftoken')
                },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });
    
            const data = await response.json();
            return {
                ok: response.ok,
                ...data
            };
        } catch (error) {
            console.error('API login error:', error);
            throw error;
        }
    },

    async signup(username, email, password) {
        try {
            const response = await fetch('/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken' : this.getCookie('csrftoken')
                },
                body: JSON.stringify({ username, email, password}),
            });

            const data = await response.json();
            return {
                ok: response.ok,
                ...data
            };
        } catch (error) {
            console.error('Signup failed js:', error);
            throw error;
        }
    },

    async verify2FA(code) {
        try {
            const response = await fetch('/auth/verify-2fa/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCookie('csrftoken'),
                },
                credentials: 'include',
                body: JSON.stringify({ code }),
            });
            
            const data = await response.json();
            return {
                ok: response.ok,
                ...data
            };
        } catch (error) {
            console.error('2FA verification error:', error);
            throw error;
        }
    }
};

export default api;