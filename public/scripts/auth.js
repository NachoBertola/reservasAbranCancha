function mostrarMensaje(mensaje) {
    const mensajeElement = document.getElementById('mensaje');
    mensajeElement.textContent = mensaje;
};

function autenticar() {
    const emailInput = document.getElementById('email').value;
    const passwordInput = document.getElementById('password').value;

    firebase.auth().signInWithEmailAndPassword(emailInput, passwordInput)
        .then((userCredential) => {
            const user = userCredential.user;
            if (user.email == 'marcelobertola@gmail.com') {
                window.location.href = '../administrador.html';
            } else {
                //mostrarMensaje('Estás logueado con las siguientes credenciales: ' + user.email);
                window.location.href = '../resCancha.html';
            }
        })
        .catch((error) => {
            mostrarMensaje('Error al iniciar sesión: ' + error.message);
        });
};

function registrar() {
    const emailInput = document.getElementById('email').value;
    const passwordInput = document.getElementById('password').value;

    firebase.auth().createUserWithEmailAndPassword(emailInput, passwordInput)
        .then((userCredential) => {
            const user = userCredential.user;
            //mostrarMensaje('Nuevo usuario registrado: ' + user.email);
            window.location.href = '../resCancha.html';
        })
        .catch((error) => {
            mostrarMensaje('Error al registrar usuario: ' + error.message);
        });
};

function cerrarSesion() {
    firebase.auth().signOut()
        .then(() => {
            //mostrarMensaje('Sesión cerrada correctamente');
            window.location.href = '../index.html';
        })
        .catch((error) => {
            //mostrarMensaje('Error al cerrar sesión: ' + error.message);
        });
};