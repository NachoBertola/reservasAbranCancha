function obtenerUsuarioAutenticado() {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
        if (user) {
            const email = user.email;
            const partesEmail = email.split('@');
            const usuario = partesEmail[0];
            const emailElemento = document.getElementById('mensaje-email');
            emailElemento.textContent = usuario;
        } else {
            console.log('No hay usuario autenticado.');
        }
        unsubscribe(); // Detenemos la escucha del cambio de estado para evitar llamadas innecesarias
    });
}

function dirigirTurnos() {
    window.location.href = '../resCancha.html';
}
  
function dirigirSalon() {
    window.location.href = '../resSalon.html';
}
  
function dirigirInformacion() {
    window.location.href = '../informacion.html';
}
  