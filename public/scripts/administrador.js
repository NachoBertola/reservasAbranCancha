function cargarTurnosReservas() {
    const fechaInput = document.getElementById('fecha');
    const fecha = fechaInput.value;
    
    cargarTablaTurnos(fecha);
    cargarTablaReservas(fecha);
}

function cargarTablaTurnos(fecha) {
    const db = firebase.firestore();
    const turnosRef = db.collection('turnos-canchas');

    const tablaTurnos = document.getElementById('tabla-turnos');
    const bodyTablaTurnos = document.getElementById('body-tabla-turnos');

    turnosRef
        .where('fecha', '==', fecha)
        .get()
        .then((querySnapshot) => {
            bodyTablaTurnos.innerHTML = '';
    
            querySnapshot.forEach((doc) => {
                const turno = doc.data();
                
                // Verificar si el documento tiene el campo "id"
                if (turno.id) {
                    return; // Ignorar el documento correspondiente al salón de eventos
                }
              
                const fila = document.createElement('tr');
                const celdaFecha = document.createElement('td');
                const celdaHora = document.createElement('td');
                const celdaCancha = document.createElement('td');
                const celdaEliminar = document.createElement('td'); // Celda para el botón de eliminar
    
                celdaFecha.textContent = turno.fecha;
                celdaHora.textContent = turno.hora;
                celdaCancha.textContent = turno.cancha;
  
                const botonEliminar = document.createElement('button');
                botonEliminar.innerHTML = '<i class="fas fa-trash-alt" style="color: red;"></i>';
                botonEliminar.className = 'boton-eliminar-icono'; // Agrega una clase CSS al botón
                botonEliminar.addEventListener('click', () => {
                    eliminarTurno(doc.id); // Llamada a la función para eliminar el turno
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
}

function cargarTablaReservas(fecha) {
    const db = firebase.firestore();
    const salonRef = db.collection('turnos-salon');
    
    const tablaReservas = document.getElementById('tabla-reservas');
    const bodyTablaReservas = document.getElementById('body-tabla-reservas');

    salonRef
        .where('fecha', '==', fecha)
        .get()
        .then((querySnapshot) => {
            bodyTablaReservas.innerHTML = '';
    
            querySnapshot.forEach((doc) => {
                const reserva = doc.data();
                
                const fila = document.createElement('tr');
                const celdaFecha = document.createElement('td');
                const celdaHora = document.createElement('td');
                const celdaCanchaAbierta = document.createElement('td');
                const celdaCanchaTechada = document.createElement('td');
                const celdaEliminar = document.createElement('td'); // Celda para el botón de eliminar
    
                celdaFecha.textContent = reserva.fecha;
                celdaHora.textContent = reserva.hora;
                celdaCanchaAbierta.textContent = reserva.canchaabierta ? 'Sí' : 'No';
                celdaCanchaTechada.textContent = reserva.canchatechada ? 'Sí' : 'No';
  
                const botonEliminar = document.createElement('button');
                botonEliminar.innerHTML = '<i class="fas fa-trash-alt" style="color: red;"></i>';
                botonEliminar.className = 'boton-eliminar-icono'; // Agrega una clase CSS al botón
                botonEliminar.addEventListener('click', () => {
                    eliminarReserva(doc.id); // Llamada a la función para eliminar la reserva
                });
  
                celdaEliminar.appendChild(botonEliminar);
    
                fila.appendChild(celdaFecha);
                fila.appendChild(celdaHora);
                fila.appendChild(celdaCanchaAbierta);
                fila.appendChild(celdaCanchaTechada);
                fila.appendChild(celdaEliminar); // Agregamos la celda del botón de eliminar a la fila
    
                bodyTablaReservas.appendChild(fila);
            });
    
            // Mostramos la tabla
            tablaReservas.style.display = 'table';
        })
        .catch((error) => {
            console.log('Error al obtener las reservas del usuario:', error);
        });
}

function eliminarTurno(turnoId) {
    // Mostrar la confirmación antes de eliminar el turno
    const confirmacion = confirm('¿Deseas eliminar el turno seleccionado?');
    const fechaInput = document.getElementById('fecha');
    const fecha = fechaInput.value;
  
    if (confirmacion) {
      const db = firebase.firestore();
      const turnosRef = db.collection('turnos-canchas');
  
      turnosRef
        .doc(turnoId)
        .delete()
        .then(() => {
          console.log('Turno eliminado correctamente');
        })
        .catch((error) => {
          console.log('Error al eliminar el turno:', error);
        });
    } 
    cargarTablaTurnos(fecha); // Cargar nuevamente la tabla de turnos
}

function eliminarReserva(docId) {
    const confirmacion = confirm('¿Deseas eliminar el turno seleccionado?');
    const fechaInput = document.getElementById('fecha');
    const fecha = fechaInput.value;
  
    if (confirmacion) {
      const db = firebase.firestore();
      const salonRef = db.collection('turnos-salon');
      const turnosRef = db.collection('turnos-canchas');
  
      salonRef
        .doc(docId)
        .get()
        .then((doc) => {
          const id = doc.data().id;
  
          // Eliminar los turnos de la colección "turnos-canchas" con el mismo id
          turnosRef
            .where('id', '==', id)
            .get()
            .then((querySnapshot) => {
              const batch = db.batch();
  
              querySnapshot.forEach((doc) => {
                const turnoRef = turnosRef.doc(doc.id);
                batch.delete(turnoRef);
              });
  
              return batch.commit();
            })
            .then(() => {
              console.log('Turnos eliminados');
  
              // Eliminar la reserva del salón de la colección "turnos-salon"
              salonRef
                .doc(docId)
                .delete()
                .then(() => {
                  console.log('Reserva borrada');
                  cargarTablaReservas(fecha); // Cargar nuevamente la tabla de reservas
                })
                .catch((error) => {
                  console.log('Error al borrar la reserva:', error);
                });
            })
            .catch((error) => {
              console.log('Error al eliminar los turnos:', error);
            });
        })
        .catch((error) => {
          console.log('Error al obtener el documento de la reserva:', error);
        });
    }
}

function eliminarReservasPasadas() {
  const fechaInput = document.getElementById('fecha');
  const fecha = fechaInput.value;

  const db = firebase.firestore();
  const turnosRef = db.collection('turnos-canchas');
  const salonRef = db.collection('turnos-salon');

  // Eliminar turnos pasados de la colección "turnos-canchas"
  turnosRef
    .get()
    .then((querySnapshot) => {
      const batch = db.batch();

      querySnapshot.forEach((doc) => {
        const turno = doc.data();
        const turnoFecha = turno.fecha;

        if (validarFechaPasada(turnoFecha)) {
          const turnoRef = turnosRef.doc(doc.id);
          batch.delete(turnoRef);
        }
      });

      return batch.commit();
    })
    .then(() => {
      console.log('Turnos pasados eliminados');
      cargarTablaTurnos(fecha); // Cargar nuevamente la tabla de turnos
    })
    .catch((error) => {
      console.log('Error al eliminar los turnos pasados:', error);
    });

  // Eliminar reservas pasadas de la colección "turnos-salon"
  salonRef
    .get()
    .then((querySnapshot) => {
      const batch = db.batch();

      querySnapshot.forEach((doc) => {
        const reserva = doc.data();
        const reservaFecha = reserva.fecha;

        if (validarFechaPasada(reservaFecha)) {
          const reservaRef = salonRef.doc(doc.id);
          batch.delete(reservaRef);
        }
      });

      return batch.commit();
    })
    .then(() => {
      console.log('Reservas pasadas eliminadas');
      cargarTablaReservas(fecha); // Cargar nuevamente la tabla de reservas
    })
    .catch((error) => {
      console.log('Error al eliminar las reservas pasadas:', error);
    });
}

function validarFechaPasada(fechaString) {
  const fechaActual = new Date();
  const [dia, mes, anio] = fechaString.split('/');

  // Ten en cuenta que el objeto Date espera el mes en base 0, por lo que restamos 1 al mes
  const fechaReserva = new Date(anio, mes - 1, dia);

  return fechaReserva < fechaActual;
}