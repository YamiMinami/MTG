const formArea = document.getElementById('index-form-wrapper');

const loginForm = document.getElementById('index-login');
const signupForm = document.getElementById('index-register');

const switchEffect = document.querySelectorAll('.index-switch-animation a');

switchEffect[0].addEventListener('click', () => {
    loginForm.style.transform = 'translateX(100%)';
    signupForm.style.transform = 'translateX(0)';

});

switchEffect[1].addEventListener('click', () => {
    loginForm.style.transform = 'translateX(0)';
    signupForm.style.transform = 'translateX(-100%)';
});