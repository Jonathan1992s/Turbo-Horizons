const canvas = document.getElementById("juegoCanvas");
const ctx = canvas.getContext("2d");
// Crear un objeto de audio
const musicaFondo = new Audio('Asset/musica_fondo.M4A'); // Ruta al archivo de música
const sonidoVictoria = new Audio('Asset/victoria.MP3'); // Ruta al archivo de música
const sonidoChoque = new Audio('Asset/choque.MP3');
 // Carga de la imagen para el fondo
const imagenFondo = new Image();
imagenFondo.src = 'Asset/R3.png'; // Cambia 'ruta_de_tu_imagen.png' por el nombre de tu archivo

let modoJuego = 1;
let jugadores = [];
let vueltaObjetivo = 3;
let pista = { x: 400, y: 312, ancho: 600, alto: 300, radioBorde: 50, interiorAncho: 500, interiorAlto: 200 };

// Cargar imágenes de los autos
const imagenAutoRojo = new Image();
imagenAutoRojo.src = 'Asset/carro1.png'; // Ruta de la imagen del auto rojo

const imagenAutoAzul = new Image();
imagenAutoAzul.src = 'Asset/carro2.png'; // Ruta de la imagen del auto azul

function crearAuto(x, y, color, controles, imagen) {
    const scaleFactor = 0.1; // Escala para hacer más pequeño el auto manteniendo proporciones
   
    return {
        x,
        y,
        ancho: imagen.width * scaleFactor,
        alto: imagen.height * scaleFactor,
        velocidad: 0,
        angulo: 0, // Dirección inicial hacia arriba
        aceleracion: 0.1,
        maxVelocidad: 1.5,
        frenado: 0.05,
        color,
        vueltas: -1,
        tiempoVuelta: 0,
        tiempos: [],
        controles,
        teclas: {},
        haCruzadoMeta: false,
        imagen
    };
}

function iniciarJuego(jugadoresCount) {
    modoJuego = jugadoresCount;
    jugadores = [
        crearAuto(400, 450, "Jugador 1", { up: "w", down: "s", left: "a", right: "d" }, imagenAutoRojo)
    ];
    if (modoJuego === 2) {
        jugadores.push(crearAuto(400, 425, "Jugador 2", { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" }, imagenAutoAzul));
    }
    document.getElementById("menu").style.display = "none";
      // Reproducir música de fondo al iniciar el juego
      musicaFondo.loop = true; // Repetir en bucle
      musicaFondo.volume = 0.1; // Ajustar volumen (0.0 a 1.0)
      musicaFondo.play();
    bucleJuego();
}

function dibujarPistaRectangular() {
    const { x, y, ancho, alto, radioBorde, interiorAncho, interiorAlto } = pista;


    // Pista exterior
    ctx.fillStyle = "#393D3E";
    
    ctx.beginPath();
    ctx.moveTo(x - ancho / 2 + radioBorde, y - alto / 2);
    ctx.lineTo(x + ancho / 2 - radioBorde, y - alto / 2);
    ctx.quadraticCurveTo(x + ancho / 2, y - alto / 2, x + ancho / 2, y - alto / 2 + radioBorde);
    ctx.lineTo(x + ancho / 2, y + alto / 2 - radioBorde);
    ctx.quadraticCurveTo(x + ancho / 2, y + alto / 2, x + ancho / 2 - radioBorde, y + alto / 2);
    ctx.lineTo(x - ancho / 2 + radioBorde, y + alto / 2);
    ctx.quadraticCurveTo(x - ancho / 2, y + alto / 2, x - ancho / 2, y + alto / 2 - radioBorde);
    ctx.lineTo(x - ancho / 2, y - alto / 2 + radioBorde);
    ctx.quadraticCurveTo(x - ancho / 2, y - alto / 2, x - ancho / 2 + radioBorde, y - alto / 2);
    ctx.closePath();
    ctx.fill();
    // Borde de neón
    ctx.strokeStyle = "#00ff99"; // Color del neón
    ctx.lineWidth = 2.5;          // Grosor del borde
    ctx.shadowBlur = 5;         // Desenfoque para efecto de luz
    ctx.shadowColor = "#00ff99"; // Color de la sombra que crea el efecto de neón
    ctx.stroke();
    // Pista interior
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.moveTo(x - interiorAncho / 2 + radioBorde, y - interiorAlto / 2);
    ctx.lineTo(x + interiorAncho / 2 - radioBorde, y - interiorAlto / 2);
    ctx.quadraticCurveTo(x + interiorAncho / 2, y - interiorAlto / 2, x + interiorAncho / 2, y - interiorAlto / 2 + radioBorde);
    ctx.lineTo(x + interiorAncho / 2, y + interiorAlto / 2 - radioBorde);
    ctx.quadraticCurveTo(x + interiorAncho / 2, y + interiorAlto / 2, x + interiorAncho / 2 - radioBorde, y + interiorAlto / 2);
    ctx.lineTo(x - interiorAncho / 2 + radioBorde, y + interiorAlto / 2);
    ctx.quadraticCurveTo(x - interiorAncho / 2, y + interiorAlto / 2, x - interiorAncho / 2, y + interiorAlto / 2 - radioBorde);
    ctx.lineTo(x - interiorAncho / 2, y - interiorAlto / 2 + radioBorde);
    ctx.quadraticCurveTo(x - interiorAncho / 2, y - interiorAlto / 2, x - interiorAncho / 2 + radioBorde, y - interiorAlto / 2);
    ctx.closePath();
    ctx.fill();
 // Borde de neón
 ctx.strokeStyle = "#00ff99"; // Color del neón
 ctx.lineWidth = 2.5;          // Grosor del borde
 ctx.shadowBlur = 5;         // Desenfoque para efecto de luz
 ctx.shadowColor = "#00ff99"; // Color de la sombra que crea el efecto de neón
 ctx.stroke();
    // Línea de meta
    ctx.strokeStyle = "white";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(x + 25, (y - alto / 2)+ 250);
    ctx.lineTo(x + 25, (y - alto / 2)+ 300);
    ctx.stroke();
}

function moverAuto(auto) {
    if (auto.vueltas >= vueltaObjetivo) return;

    let prevX = auto.x;
    let prevY = auto.y;

    if (auto.teclas[auto.controles.left]) auto.angulo -= 0.05;
    if (auto.teclas[auto.controles.right]) auto.angulo += 0.05;
    if (auto.teclas[auto.controles.up]) {
        if (auto.velocidad < auto.maxVelocidad) auto.velocidad += auto.aceleracion;
    } else if (auto.teclas[auto.controles.down]) {
        if (auto.velocidad > -auto.maxVelocidad / 2) auto.velocidad -= auto.aceleracion;
    } else {
        if (auto.velocidad > 0) auto.velocidad -= auto.frenado;
        if (auto.velocidad < 0) auto.velocidad += auto.frenado;
    }

    auto.x += auto.velocidad * Math.cos(auto.angulo);
    auto.y += auto.velocidad * Math.sin(auto.angulo);

    const { x, y, ancho, alto, interiorAncho, interiorAlto } = pista;
    const dx = Math.abs(auto.x - x);
    const dy = Math.abs(auto.y - y);

    if (dx > ancho / 2 || dy > alto / 2 || (dx < interiorAncho / 2 && dy < interiorAlto / 2)) {
          // Reproducir sonido de choque
            // Reproducir sonido de choque solo si no está reproduciéndose
        if (sonidoChoque.paused) {
            sonidoChoque.play();
        }
        
        auto.x = prevX;
        auto.y = prevY;
        auto.velocidad = 0;
        
    }

     // Verificación de cruce de la línea de meta vertical
     if (prevX < pista.x + 25 && auto.x >= pista.x + 25 && auto.y > pista.y + 100 && auto.y < pista.y + 150) {
        if (!auto.haCruzadoMeta) {
            auto.vueltas++;
            if(auto.vueltas>0) {
                auto.tiempos.push(auto.tiempoVuelta.toFixed(2)); // Registrar tiempo de la vuelta
            }
            auto.haCruzadoMeta = true;
            auto.tiempoVuelta = 0;
            if (auto.vueltas >= vueltaObjetivo) verificarGanador();
        }
    } else if (auto.x < pista.x + 25) {
        auto.haCruzadoMeta = false;
    }

    auto.tiempoVuelta += 1 / 60;
}

let mensajeGanador = ""; // Variable para almacenar el mensaje del ganador
let juegoFinalizado = false; // Indica si el juego terminó

function verificarGanador() {
    const ganador = jugadores.find(j => j.vueltas >= vueltaObjetivo);
    if (ganador && !juegoFinalizado) {
        const tiemposPorVuelta = ganador.tiempos.map((tiempo, index) => `Vuelta ${index + 1}: ${tiempo} s`).join('\n');
        mensajeGanador = `¡Ganador: ${ganador.color}!\nTiempos por vuelta:\n${tiemposPorVuelta}`;
        // Reproducir el sonido de victoria
        sonidoVictoria.play();
        musicaFondo.pause(); // Pausar la música de fondo
        musicaFondo.currentTime = 0; // Reiniciar la música (opcional)
        juegoFinalizado = true; // Marcar que el juego ha terminado
    }
}

function mostrarMensajeGanador() {
    if (mensajeGanador) {
        ctx.fillStyle = "white";
        ctx.font = "15px Russo One";
        ctx.textAlign = "center"; // Centrar el texto horizontalmente
        ctx.textBaseline = "top"; // Posicionar el texto desde la parte superior

        const lineas = mensajeGanador.split('\n');
        const centroX = canvas.width / 2; // Calcular el centro horizontal del canvas
        const inicioY = 240; // Margen desde la parte superior

        lineas.forEach((linea, index) => {
            console.log(index);
            if(index==0)
            {
                ctx.fillStyle = "yellow";
                ctx.font = "20px Russo One"; 
            }else{
                ctx.fillStyle = "white";
                ctx.font = "15px Russo One";  
            }
            ctx.fillText(linea, centroX, inicioY + index * 30); // Mostrar mensaje línea por línea
        });

        // Restaurar alineación de texto para no afectar otros dibujos
        ctx.textAlign = "start";
        ctx.textBaseline = "alphabetic";
    }
}


function dibujarAuto(auto) {
    ctx.save();
    ctx.translate(auto.x, auto.y);
    ctx.rotate(auto.angulo);
    ctx.drawImage(auto.imagen, -auto.ancho / 2, -auto.alto / 2, auto.ancho, auto.alto);
    ctx.restore();
}

function mostrarTiempos() {
    ctx.fillStyle = "white";
 
    ctx.font = "15px Russo One";
    jugadores.forEach((jugador, index) => {
        const vueltasMostradas = jugador.vueltas === -1 ? 0 : jugador.vueltas; // Mostrar 0 si es -1
        ctx.fillText(`Jugador ${index + 1}: ${vueltasMostradas} vueltas, ${jugador.tiempoVuelta.toFixed(2)} s`, 10, 20 + index * 20);
    });
}


window.addEventListener("keydown", (e) => {
    jugadores.forEach(jugador => {
        jugador.teclas[e.key] = true;
    });
});
window.addEventListener("keyup", (e) => {
    jugadores.forEach(jugador => {
        jugador.teclas[e.key] = false;
    });
});

function bucleJuego() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dibujarPistaRectangular();
    mostrarTiempos();

    jugadores.forEach((jugador) => {
        moverAuto(jugador);
        dibujarAuto(jugador);
    });
    mostrarMensajeGanador(); // Mostrar el mensaje del ganador si existe
    requestAnimationFrame(bucleJuego);
}
