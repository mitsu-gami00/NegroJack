const palos = ["clubs","diamonds","hearts","spades"];
const valores = [
    "A","02","03","04","05",
    "06","07","08","09","10",
    "J","Q","K"
];

let mazo = [];
let jugador = [];
let crupier = [];
let fichas = 1000;
let juegoTerminado = false;

function crearMazo(){

    mazo = [];

    for(let palo of palos){

        for(let valor of valores){

            mazo.push({
                nombre:`card_${palo}_${valor}`,
                valor:obtenerValor(valor)
            });
        }
    }

    mazo.sort(()=>Math.random()-0.5);
}

function obtenerValor(carta){

    if(carta === "A") return 11;

    if(
        carta === "J" ||
        carta === "Q" ||
        carta === "K"
    ){
        return 10;
    }

    return parseInt(carta);
}

function tomarCarta(){
    return mazo.pop();
}

function mostrarCarta(carta,contenedor,oculta=false){

    const img = document.createElement("img");

    if(oculta){
        img.src = "cartas/card_back.png";
        img.dataset.real = `cartas/${carta.nombre}.png`;
        img.id = "cartaOculta";
    }
    else{
        img.src = `cartas/${carta.nombre}.png`;
    }

    img.classList.add("carta");

    contenedor.appendChild(img);

    document.getElementById("sonidoCarta").play();
}

function calcularPuntos(mano){

    let total = mano.reduce((acc,c)=>acc+c.valor,0);

    let ases = mano.filter(c=>c.valor===11).length;

    while(total > 21 && ases > 0){
        total -= 10;
        ases--;
    }

    return total;
}

function actualizarPuntos(){

    document.getElementById("puntosJugador")
    .textContent = calcularPuntos(jugador);

    if(juegoTerminado){
        document.getElementById("puntosCrupier")
        .textContent = calcularPuntos(crupier);
    }
    else{
        document.getElementById("puntosCrupier")
        .textContent = "?";
    }
}

function pedirCarta(){

    if(juegoTerminado) return;

    const carta = tomarCarta();

    jugador.push(carta);

    mostrarCarta(
        carta,
        document.getElementById("cartasJugador")
    );

    actualizarPuntos();

    verificarJugador();
}

function verificarJugador(){

    const puntos = calcularPuntos(jugador);

    if(puntos > 21){

        terminarJuego("💀 Perdiste");

        perderApuesta();
    }

    if(puntos === 21){
        quedarse();
    }
}

function quedarse(){

    if(juegoTerminado) return;

    const cartaOculta = document.getElementById("cartaOculta");

    if(cartaOculta){
        cartaOculta.src = cartaOculta.dataset.real;
    }

    juegoTerminado = true;

    actualizarPuntos();

    juegoTerminado = false;

    while(calcularPuntos(crupier) < 17){

        const carta = tomarCarta();

        crupier.push(carta);

        mostrarCarta(
            carta,
            document.getElementById("cartasCrupier")
        );

        actualizarPuntos();
    }

    decidirGanador();
}

function decidirGanador(){

    const puntosJugador = calcularPuntos(jugador);
    const puntosCrupier = calcularPuntos(crupier);

    if(
        puntosCrupier > 21 ||
        puntosJugador > puntosCrupier
    ){
        terminarJuego("🎉 Ganaste");
        ganarApuesta();
        return;
    }

    if(puntosJugador < puntosCrupier){
        terminarJuego("😢 El crupier gana");
        perderApuesta();
        return;
    }

    terminarJuego("🤝 Empate");
}

function terminarJuego(texto){

    juegoTerminado = true;

    document.getElementById("mensaje")
    .textContent = texto;
}

function ganarApuesta(){

    const apuesta = parseInt(
        document.getElementById("apuesta").value
    );

    fichas += apuesta;

    document.getElementById("fichas")
    .textContent = fichas;

    document.getElementById("sonidoGanar").play();
}

function perderApuesta(){

    const apuesta = parseInt(
        document.getElementById("apuesta").value
    );

    fichas -= apuesta;

    if(fichas < 0){
        fichas = 0;
    }

    document.getElementById("fichas")
    .textContent = fichas;

    document.getElementById("sonidoPerder").play();
}

function nuevoJuego(){

    juegoTerminado = false;

    jugador = [];
    crupier = [];

    document.getElementById("cartasJugador")
    .innerHTML = "";

    document.getElementById("cartasCrupier")
    .innerHTML = "";

    document.getElementById("mensaje")
    .textContent = "";

    crearMazo();

    for(let i=0;i<2;i++){

        let cartaJugador = tomarCarta();
        jugador.push(cartaJugador);

        mostrarCarta(
            cartaJugador,
            document.getElementById("cartasJugador")
        );

        let cartaCrupier = tomarCarta();
        crupier.push(cartaCrupier);

        mostrarCarta(
            cartaCrupier,
            document.getElementById("cartasCrupier"),
            i === 0
        );
    }

    actualizarPuntos();
}

nuevoJuego();
