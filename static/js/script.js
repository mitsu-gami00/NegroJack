const palos = [
    "clubs",
    "diamonds",
    "hearts",
    "spades"
];

const valores = [
    "A", "02", "03", "04", "05",
    "06", "07", "08", "09", "10",
    "J", "Q", "K"
];


let mazo = [];

let jugador = [];
let crupier = [];

let fichas = 1000;

let apuestaActual = 0;

let juegoTerminado = false;

let seDividio = false;

let manos = [];

let manoActual = 0;


/* =========================
   CREAR MAZO
========================= */

function crearMazo(){

    mazo = [];

    for(let palo of palos){

        for(let valor of valores){

            mazo.push({

                nombre:`card_${palo}_${valor}`,

                valor:obtenerValor(valor),

                carta:valor

            });

        }

    }

    mazo.sort(() => Math.random() - 0.5);
}


/* =========================
   VALOR DE CARTA
========================= */

function obtenerValor(carta){

    if(carta === "A"){
        return 11;
    }

    if(
        carta === "J" ||
        carta === "Q" ||
        carta === "K"
    ){
        return 10;
    }

    return parseInt(carta);
}


/* =========================
   TOMAR CARTA
========================= */

function tomarCarta(){

    return mazo.pop();

}


/* =========================
   MOSTRAR CARTA
========================= */

function mostrarCarta(
    carta,
    contenedor,
    oculta = false
){

    const img = document.createElement("img");

    if(oculta){

        img.src = "cartas/card_back.png";

        img.dataset.real =
            `cartas/${carta.nombre}.png`;

        img.id = "cartaOculta";

    }
    else{

        img.src =
            `cartas/${carta.nombre}.png`;

    }

    img.classList.add("carta");

    contenedor.appendChild(img);

    document
        .getElementById("sonidoCarta")
        .play()
        .catch(() => {});

}


/* =========================
   CALCULAR PUNTOS
========================= */

function calcularPuntos(mano){

    let total = mano.reduce(
        (acc, carta) => acc + carta.valor,
        0
    );

    let ases = mano.filter(
        carta => carta.valor === 11
    ).length;

    while(total > 21 && ases > 0){

        total -= 10;

        ases--;

    }

    return total;

}


/* =========================
   ACTUALIZAR PUNTOS
========================= */

function actualizarPuntos(){

    let mano = manos.length > 0
        ? manos[manoActual].cartas
        : jugador;

    document.getElementById(
        "puntosJugador"
    ).textContent =
        calcularPuntos(mano);


    if(juegoTerminado){

        document.getElementById(
            "puntosCrupier"
        ).textContent =
            calcularPuntos(crupier);

    }
    else{

        document.getElementById(
            "puntosCrupier"
        ).textContent = "?";

    }

}


/* =========================
   ACTUALIZAR FICHAS
========================= */

function actualizarFichas(){

    document.getElementById(
        "fichas"
    ).textContent = fichas;

}


/* =========================
   OBTENER APUESTA
========================= */

function obtenerApuesta(){

    const input =
        document.getElementById("apuesta");

    let apuesta =
        parseInt(input.value);


    if(isNaN(apuesta)){
        return 0;
    }

    return apuesta;

}


/* =========================
   VALIDAR APUESTA
========================= */

function validarApuesta(){

    const apuesta =
        obtenerApuesta();


    if(apuesta <= 0){

        alert(
            "La apuesta debe ser mayor que 0."
        );

        return false;

    }


    if(apuesta > fichas){

        alert(
            "No tienes suficientes fichas para esa apuesta."
        );

        return false;

    }


    return true;

}


/* =========================
   COBRAR APUESTA
========================= */

function cobrarApuesta(){

    fichas -= apuestaActual;

    actualizarFichas();

}


/* =========================
   PAGAR GANANCIA
========================= */

function pagarGanancia(multiplicador){

    const ganancia =
        apuestaActual * multiplicador;

    fichas += apuestaActual + ganancia;

    actualizarFichas();

}


/* =========================
   PEDIR CARTA
========================= */

function pedirCarta(){

    if(juegoTerminado){
        return;
    }


    const mano =
        manos[manoActual].cartas;


    const carta =
        tomarCarta();


    mano.push(carta);


    mostrarCarta(
        carta,
        document.getElementById(
            "cartasJugador"
        )
    );


    actualizarPuntos();


    const puntos =
        calcularPuntos(mano);


    if(puntos > 21){

        mensajeJugador(
            "💀 Te pasaste de 21"
        );

        finalizarManoActual();

        return;

    }


    if(puntos === 21){

        quedarse();

    }

}


/* =========================
   QUEDARSE
========================= */

function quedarse(){

    if(juegoTerminado){
        return;
    }


    const cartaOculta =
        document.getElementById(
            "cartaOculta"
        );


    if(cartaOculta){

        cartaOculta.src =
            cartaOculta.dataset.real;

    }


    jugarCrupier();

}


/* =========================
   JUGAR CRUPIER
========================= */

function jugarCrupier(){

    while(
        calcularPuntos(crupier) < 17
    ){

        const carta =
            tomarCarta();

        crupier.push(carta);


        mostrarCarta(
            carta,
            document.getElementById(
                "cartasCrupier"
            )
        );

    }


    juegoTerminado = true;

    actualizarPuntos();

    decidirGanador();

}


/* =========================
   DOBLAR APUESTA
========================= */

function doblarApuesta(){

    if(juegoTerminado){
        return;
    }


    if(seDividio){

        alert(
            "No puedes doblar después de dividir."
        );

        return;

    }


    const mano =
        manos[manoActual].cartas;


    if(mano.length !== 2){

        alert(
            "Solo puedes doblar con tus dos cartas iniciales."
        );

        return;

    }


    if(fichas < apuestaActual){

        alert(
            "No tienes suficientes fichas para doblar."
        );

        return;

    }


    fichas -= apuestaActual;

    apuestaActual *= 2;

    actualizarFichas();


    const carta =
        tomarCarta();


    mano.push(carta);


    mostrarCarta(
        carta,
        document.getElementById(
            "cartasJugador"
        )
    );


    actualizarPuntos();


    if(
        calcularPuntos(mano) > 21
    ){

        finalizarManoActual();

        return;

    }


    quedarse();

}


/* =========================
   DIVIDIR
========================= */

function dividir(){

    if(juegoTerminado){
        return;
    }


    if(seDividio){

        alert(
            "Solo puedes dividir una vez."
        );

        return;

    }


    const mano =
        manos[manoActual].cartas;


    if(mano.length !== 2){

        alert(
            "Solo puedes dividir tus dos cartas iniciales."
        );

        return;

    }


    if(
        mano[0].valor !== mano[1].valor
    ){

        alert(
            "Solo puedes dividir cartas del mismo valor."
        );

        return;

    }


    if(fichas < apuestaActual){

        alert(
            "No tienes suficientes fichas para dividir."
        );

        return;

    }


    seDividio = true;


    fichas -= apuestaActual;

    actualizarFichas();


    const carta1 = mano[0];
    const carta2 = mano[1];


    manos = [

        {
            cartas:[carta1],
            apuesta:apuestaActual
        },

        {
            cartas:[carta2],
            apuesta:apuestaActual
        }

    ];


    manoActual = 0;


    renderizarManoActual();


    agregarCartaSplit();

}


/* =========================
   AGREGAR CARTA AL SPLIT
========================= */

function agregarCartaSplit(){

    const mano =
        manos[manoActual].cartas;


    const carta =
        tomarCarta();


    mano.push(carta);


    mostrarCarta(
        carta,
        document.getElementById(
            "cartasJugador"
        )
    );


    actualizarPuntos();

}


/* =========================
   FINALIZAR MANO
========================= */

function finalizarManoActual(){

    if(
        seDividio &&
        manoActual === 0
    ){

        manoActual = 1;

        renderizarManoActual();

        agregarCartaSplit();

        return;

    }


    jugarCrupier();

}


/* =========================
   RENDERIZAR MANO
========================= */

function renderizarManoActual(){

    const contenedor =
        document.getElementById(
            "cartasJugador"
        );


    contenedor.innerHTML = "";


    const mano =
        manos[manoActual].cartas;


    for(const carta of mano){

        mostrarCarta(
            carta,
            contenedor
        );

    }


    actualizarPuntos();

}


/* =========================
   DECIDIR GANADOR
========================= */

function decidirGanador(){

    const puntosCrupier =
        calcularPuntos(crupier);


    let resultados = [];


    for(
        let i = 0;
        i < manos.length;
        i++
    ){

        const puntosJugador =
            calcularPuntos(
                manos[i].cartas
            );


        let resultado;


        if(puntosJugador > 21){

            resultado = "perdio";

        }

        else if(puntosCrupier > 21){

            resultado = "gano";

        }

        else if(
            puntosJugador > puntosCrupier
        ){

            resultado = "gano";

        }

        else if(
            puntosJugador < puntosCrupier
        ){

            resultado = "perdio";

        }

        else{

            resultado = "empate";

        }


        resultados.push(resultado);

    }


    pagarResultados(resultados);

}


/* =========================
   PAGAR RESULTADOS
========================= */

function pagarResultados(resultados){

    let gananciaTotal = 0;

    let texto = "";


    resultados.forEach(
        (resultado, index) => {

            const apuesta =
                manos[index].apuesta;


            if(resultado === "gano"){

                fichas += apuesta * 2;

                gananciaTotal += apuesta;

            }

            else if(resultado === "empate"){

                fichas += apuesta;

            }

        }
    );


    if(resultados.length === 1){

        if(resultados[0] === "gano"){

            texto = "🎉 Ganaste";

            document
                .getElementById("sonidoGanar")
                .play()
                .catch(() => {});

        }

        else if(
            resultados[0] === "perdio"
        ){

            texto = "😢 El crupier gana";

            document
                .getElementById("sonidoPerder")
                .play()
                .catch(() => {});

        }

        else{

            texto = "🤝 Empate";

        }

    }

    else{

        const ganadas =
            resultados.filter(
                r => r === "gano"
            ).length;

        const perdidas =
            resultados.filter(
                r => r === "perdio"
            ).length;


        texto =
            `🎰 Split: ${ganadas} ganada(s), ${perdidas} perdida(s)`;

    }


    actualizarFichas();

    terminarJuego(texto);

}


/* =========================
   MENSAJE
========================= */

function mensajeJugador(texto){

    document.getElementById(
        "mensaje"
    ).textContent = texto;

}


/* =========================
   TERMINAR JUEGO
========================= */

function terminarJuego(texto){

    juegoTerminado = true;


    document.getElementById(
        "mensaje"
    ).textContent = texto;


    actualizarPuntos();


    if(fichas <= 0){

        setTimeout(
            mostrarGameOver,
            700
        );

    }

}


/* =========================
   GAME OVER
========================= */

function mostrarGameOver(){

    document
        .getElementById("gameOver")
        .classList.add("activo");

}


/* =========================
   REINICIAR CASINO
========================= */

function reiniciarCasino(){

    fichas = 1000;

    document
        .getElementById("gameOver")
        .classList.remove("activo");


    actualizarFichas();

    nuevoJuego();

}


/* =========================
   NUEVO JUEGO
========================= */

function nuevoJuego(){

    if(fichas <= 0){

        mostrarGameOver();

        return;

    }


    if(!validarApuesta()){

        return;

    }


    juegoTerminado = false;

    seDividio = false;

    jugador = [];

    crupier = [];

    manos = [];

    manoActual = 0;


    apuestaActual =
        obtenerApuesta();


    document.getElementById(
        "cartasJugador"
    ).innerHTML = "";


    document.getElementById(
        "cartasCrupier"
    ).innerHTML = "";


    document.getElementById(
        "mensaje"
    ).textContent = "";


    crearMazo();


    /* COBRAR APUESTA */

    cobrarApuesta();


    /*
        MANO INICIAL
    */

    const carta1 =
        tomarCarta();

    const carta2 =
        tomarCarta();


    jugador.push(carta1, carta2);


    manos.push({

        cartas:jugador,

        apuesta:apuestaActual

    });


    mostrarCarta(
        carta1,
        document.getElementById(
            "cartasJugador"
        )
    );


    mostrarCarta(
        carta2,
        document.getElementById(
            "cartasJugador"
        )
    );


    /*
        CRUPIER
    */

    const cartaCrupier1 =
        tomarCarta();

    const cartaCrupier2 =
        tomarCarta();


    crupier.push(
        cartaCrupier1,
        cartaCrupier2
    );


    mostrarCarta(
        cartaCrupier1,
        document.getElementById(
            "cartasCrupier"
        ),
        true
    );


    mostrarCarta(
        cartaCrupier2,
        document.getElementById(
            "cartasCrupier"
        )
    );


    actualizarPuntos();


    /*
        BLACKJACK NATURAL
    */

    const puntosJugador =
        calcularPuntos(jugador);


    if(puntosJugador === 21){

        revelarCrupier();

        juegoTerminado = true;


        const puntosCrupier =
            calcularPuntos(crupier);


        if(puntosCrupier === 21){

            fichas += apuestaActual;

            actualizarFichas();

            terminarJuego(
                "🤝 Blackjack de ambos"
            );

        }
        else{

            /*
                Blackjack paga 3:2
            */

            fichas +=
                apuestaActual +
                apuestaActual * 1.5;


            actualizarFichas();


            terminarJuego(
                "🃏 BLACKJACK 🎉"
            );

        }

    }

}


/* =========================
   REVELAR CRUPIER
========================= */

function revelarCrupier(){

    const cartaOculta =
        document.getElementById(
            "cartaOculta"
        );


    if(cartaOculta){

        cartaOculta.src =
            cartaOculta.dataset.real;

    }

}


/* =========================
   INICIO
========================= */

nuevoJuego();