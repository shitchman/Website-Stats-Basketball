document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const usernameinput = document.getElementById('username');
    const passwordinput = document.getElementById('password');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = usernameinput.value.trim(); //The .trim() method removes whitespace from both ends of a string, ensuring that the username is not just spaces.
        const password = passwordinput.value;

        if (username === '' || password === '') {
            window.location.href = 'base_dashboard.html';
            return;
        } 

        loginAlert.classList.add('d-none');
    });
});
