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

function cargarTurnosDisponibles() {
  const canchaSelect = document.getElementById('cancha');
  const fechaInput = document.getElementById('fecha');
  //const horaSelect = document.getElementById('hora');

  const cancha = canchaSelect.value;
  const fecha = fechaInput.value;

  const db = firebase.firestore();
  const turnosRef = db.collection('turnos-canchas');

  turnosRef
      .where('cancha', '==', cancha)
      .where('fecha', '==', fecha)
      .get()
      .then((querySnapshot) => {
          const horasOcupadas = [];
          querySnapshot.forEach((doc) => {
              //console.log((doc.data().fecha) == fecha)
              const horaOcupada = parseInt(doc.data().hora);
              horasOcupadas.push(horaOcupada);
          });

          const selectHora = document.getElementById('hora');
          selectHora.innerHTML = '';
          
          for (let i = 16; i <= 22; i++) {
              if (!horasOcupadas.includes(i)) {
                  const option = document.createElement('option');
                  option.value = i;
                  option.text = i;
                  selectHora.appendChild(option);
              }
          }
      })
      .catch((error) => {
          console.log('Error al cargar los turnos disponibles:', error);
      });
}

document.addEventListener('DOMContentLoaded', function() {
  const canchaSelect = document.getElementById('cancha');
  const fechaInput = document.getElementById('fecha');

  canchaSelect.addEventListener('change', function() {
      cargarTurnosDisponibles();
  });

  fechaInput.addEventListener('change', cargarTurnosDisponibles());

  cargarTurnosDisponibles();
});

function cargarFormularioTurnos() {
  const canchaSelect = document.getElementById('cancha');
  const fechaInput = document.getElementById('fecha');
  const horaInput = document.getElementById('hora');

  const cancha = canchaSelect.value;
  const cliente = firebase.auth().currentUser.email;
  const fecha = fechaInput.value;
  const hora = horaInput.value;

  // Verificar si se ha seleccionado una fecha y una cancha
  if (!fecha || !cancha) {
    alert('Debes seleccionar una fecha y una cancha');
    return; // Salir de la función si no se han seleccionado ambos valores
  }

  //crear documento a guardar
  const turno = {
      cancha: cancha,
      cliente: cliente,
      fecha: fecha,
      hora: hora
  };

  // Mostrar la confirmación antes de guardar el turno
  const confirmacion = confirm(
    '¿Deseas confirmar la reserva del turno?\n\nCancha: ' +
      cancha +
      '\nFecha: ' +
      fecha +
      '\nHora: ' +
      hora
  );

  if (confirmacion) {
    const db = firebase.firestore();
    const turnosRef = db.collection('turnos-canchas');

    turnosRef
      .add(turno)
      .then(() => {
        //mostrarMensaje('Turno agregado correctamente');
        //limpiarFormulario();
        cargarTurnosDisponibles(); // Actualizar las opciones de hora después de agregar un turno
      })
      .catch((error) => {
        mostrarMensaje('Error al agregar el turno: ' + error.message);
      });
    mostrarTurnosUsuario();
  }
}

function mostrarTurnosUsuario() {
  const tablaTurnos = document.getElementById('tabla-turnos');
  const bodyTablaTurnos = document.getElementById('body-tabla-turnos');
  const usuario = firebase.auth().currentUser;

  if (usuario) {
    const userEmail = usuario.email;
    const db = firebase.firestore();
    const turnosRef = db.collection('turnos-canchas');

    turnosRef
      .where('cliente', '==', userEmail)
      .get()
      .then((querySnapshot) => {
        // Limpiamos el contenido actual de la tabla
        bodyTablaTurnos.innerHTML = '';

        //const fechaActual = new Date(); // Obtener la fecha actual

        const turnos = []; // Array para almacenar los turnos futuros

        querySnapshot.forEach((doc) => {
          // Verificar si el documento tiene el campo "id"
          if (doc.data().id) {
            return; // Ignorar el documento correspondiente al salón de eventos
          }

          const turno = doc.data();

          // Validar si la fecha del turno ya pasó
          if (validarFechaPasada(turno.fecha)) {
            return; // Ignorar el turno que ya pasó
          }

          const [dia, mes, anio] = turno.fecha.split('/');
          const hora = turno.hora; // La hora ya es un número entero

          turno.fecha = buildDate(anio, mes, dia, hora); // Construir la fecha y hora a partir de los datos
          turno.id = doc.id; // Asignar el valor del doc.id al campo "id" del objeto "turno"


          turnos.push(turno); // Agregar el turno futuro al array de turnos
        });

        // Ordenar los turnos por fecha y hora (de los más próximos a los más lejanos)
        turnos.sort((a, b) => a.fecha - b.fecha);

        // Mostrar los turnos ordenados en la tabla
        turnos.forEach((turno) => {
          const fila = document.createElement('tr');
          const celdaFecha = document.createElement('td');
          const celdaHora = document.createElement('td');
          const celdaCancha = document.createElement('td');
          const celdaEliminar = document.createElement('td'); // Celda para el botón de eliminar

          celdaFecha.textContent = turno.fecha.toLocaleDateString(); // Convertir la fecha a formato legible
          celdaHora.textContent = turno.hora;
          celdaCancha.textContent = turno.cancha;

          const botonEliminar = document.createElement('button');
          botonEliminar.innerHTML = '<i class="fas fa-trash-alt"></i>';
          botonEliminar.className = 'boton-eliminar'; // Agrega una clase CSS al botón
          botonEliminar.addEventListener('click', () => {
            eliminarTurno(turno.id); // Llamada a la función para eliminar el turno
          });

          celdaEliminar.appendChild(botonEliminar);

          fila.appendChild(celdaFecha);
          fila.appendChild(celdaHora);
          fila.appendChild(celdaCancha);
          fila.appendChild(celdaEliminar); // Agregamos la celda del botón de eliminar a la fila

          bodyTablaTurnos.appendChild(fila);
        });

        // Mostramos la tabla
        tablaTurnos.style.display = 'table';
      })
      .catch((error) => {
        console.log('Error al obtener los turnos del usuario:', error);
      });
  } else {
    // No hay usuario autenticado, ocultamos la tabla
    tablaTurnos.style.display = 'none';
  }
}

// Función auxiliar para construir la fecha y hora correctamente
function buildDate(year, month, day, hour) {
  const date = new Date(year, month - 1, day);
  date.setHours(hour);
  return date;
}

function eliminarTurno(turnoId) {
  console.log('Eliminando turno:', turnoId); // Agregar esta línea para verificar el turnoId

  // Mostrar la confirmación antes de eliminar el turno
  const confirmacion = confirm('¿Deseas eliminar el turno seleccionado?');

  if (confirmacion) {
    const db = firebase.firestore();
    const turnosRef = db.collection('turnos-canchas');

    turnosRef
      .doc(turnoId)
      .delete()
      .then(() => {
        console.log('Turno eliminado correctamente');
        mostrarTurnosUsuario();
        cargarTurnosDisponibles();
      })
      .catch((error) => {
        console.log('Error al eliminar el turno:', error);
      });
  } 
}

function validarFechaPasada(fechaString) {
  const fechaActual = new Date();
  const [dia, mes, anio] = fechaString.split('/');

  // Ten en cuenta que el objeto Date espera el mes en base 0, por lo que restamos 1 al mes
  const fechaReserva = new Date(anio, mes - 1, dia);

  // Comparamos solo el día, mes y año sin tener en cuenta la hora
  fechaActual.setHours(0, 0, 0, 0);
  fechaReserva.setHours(0, 0, 0, 0);

  return fechaReserva < fechaActual;
}

function dirigirSalon() {
  window.location.href = '../resSalon.html';
}

function dirigirNosotros() {
  window.location.href = '../nosotros.html';
}

function dirigirInformacion() {
  window.location.href = '../informacion.html';
}
