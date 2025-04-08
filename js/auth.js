document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const selectedRole = document.querySelector('input[name="role"]:checked').value;
            const userData = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                role: selectedRole
            };

            try {
                const response = await fetch('http://localhost:5000/api/signin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    document.getElementById('message').style.color = 'green';
                    document.getElementById('message').textContent = 'Login successful!';
                    localStorage.setItem('user', JSON.stringify({
                        ...data.user,
                        role: selectedRole
                    }));

                    setTimeout(() => {
                        if (selectedRole === 'mentor') {
                            window.location.href = 'mentor.html';
                        } else {
                            window.location.href = 'index.html';
                        }
                    }, 1500);
                } else {
                    document.getElementById('message').style.color = 'red';
                    document.getElementById('message').textContent = data.message || 'Invalid credentials';
                }
            } catch (error) {
                document.getElementById('message').style.color = 'red';
                document.getElementById('message').textContent = 'Login failed. Please try again.';
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const selectedRole = document.querySelector('input[name="role"]:checked').value;
            const userData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                role: selectedRole
            };

            try {
                const response = await fetch('http://localhost:5000/api/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    document.getElementById('message').style.color = 'green';
                    document.getElementById('message').textContent = 'Registration successful!';
                    localStorage.setItem('user', JSON.stringify({
                        ...data.user,
                        role: selectedRole
                    }));

                    setTimeout(() => {
                        if (selectedRole === 'mentor') {
                            window.location.href = 'mentor.html';
                        } else {
                            window.location.href = 'index.html';
                        }
                    }, 1500);
                } else {
                    document.getElementById('message').style.color = 'red';
                    document.getElementById('message').textContent = data.message || 'Registration failed';
                }
            } catch (error) {
                document.getElementById('message').style.color = 'red';
                document.getElementById('message').textContent = 'Registration failed. Please try again.';
            }
        });
    }
});
