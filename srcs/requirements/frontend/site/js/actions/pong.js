import { navigate  } from "../router.js"
import { handleError } from "../api.js";

export const pongActions = [
    {
        selector: '[data-action="playGameSolo"]',
        handler: initGameSolo
    },
    {
        selector: '[data-action="playGameMultiplayer"]',
        handler: initGameMulti
    },
    // {
    //     selector: '[data-action="playGameOnline"]',
    //     handler: initGameOnline
    // },
];

let isPaused = true;
let socket;
let interval;
let canvas;
let ctx;
let keysPressed = {
    "ArrowUp": false,
    "ArrowDown": false,
    "w": false,
    "s": false,
};

function initGameSolo()
{
    navigate('pong');
    setTimeout(function() {
        socket = new WebSocket("/ws/pong/solo/");   // solo
        playGame("solo");
    }, 500)
}

function initGameMulti()
{
    navigate('pong');
    setTimeout(function() {
        socket = new WebSocket("/ws/pong/multi/");   // multi
        playGame("multi");
    }, 500)
}

// function initGameOnline()
// {
//     navigate('pong');
//     setTimeout(function() {
//         socket = new WebSocket("/ws/pong/online/");   // online/id --> comment specifier lid en question ? voir avec ja
//         playGame();
//     }, 500)
// }

function handleSocket()
{
    socket.onopen = function ()
    {
        console.log("✅ WebSocket connected!");
    };
    
    socket.onerror = function (error)
    {
        console.error("❌ WebSocket error:", error);
    };
    
    socket.onclose = function ()
    {
        console.log("🔴 WebSocket closed.");
    };
}

export function closeSocket()
{
    if (socket)
    {
        socket.close();
    }
}

function statePause()
{
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)"; // Light overlay
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Transparent overlay

    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.textAlign = "center";

    const barWidth = 20;
    const barHeight = 100;
    const pauseX = canvas.width / 2 - 40;
    const pauseY = canvas.height / 2 - barHeight / 2;

    ctx.fillRect(pauseX + 10, pauseY, barWidth, barHeight);
    ctx.fillRect(pauseX + 50, pauseY, barWidth, barHeight);
}

function drawBall(x, y, r)
{
    ctx.beginPath();
    ctx.arc(
        x * canvas.width / 100,
        y * canvas.height / 100,
        r * canvas.width / 100,
        0,
        Math.PI * 2 
    );
    ctx.fill();
};

function drawPaddle(state)
{
    ctx.fillRect(
        state.left.top_left_corner.x * canvas.width / 100,
        state.left.top_left_corner.y * canvas.height / 100,
        state.left.width * canvas.width / 100,
        state.left.height * canvas.height / 100
    );
    ctx.fillRect(
        state.right.top_left_corner.x * canvas.width / 100,
        state.right.top_left_corner.y * canvas.height / 100,
        state.right.width * canvas.width / 100,
        state.right.height * canvas.height / 100
    );
}

function handleEndGame()
{
    const winnerModal = new bootstrap.Modal(document.getElementById('winnerModal'));
    winnerModal.show();

    const closeendgame = document.getElementById('closeendgame');
    closeendgame.addEventListener('click', function(){
        navigate("playerMode");
    })
    const closeendgame1 = document.getElementById('closeendgame1');
    closeendgame1.addEventListener('click', function(){
        navigate("playerMode");
    })
    const rejouer = document.getElementById('rejouer');
    rejouer.addEventListener('click', function() {
        initGameMulti();
    })
}

function messageSocket() 
{
    socket.onmessage = function(event)
    {
        const state = JSON.parse(event.data);

        if (state.alert)
        {
            handleError(state.alert, "handle game error")
        };
        
        document.getElementById("leftScore").textContent = state.score[0];
        document.getElementById("rightScore").textContent = state.score[1];
        if (state.score[0] == 1 || state.score[1] == 1)
        {
            closeSocket();
            handleEndGame();
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
    
        drawBall(state.ball.x, state.ball.y, state.ball.r);
        drawPaddle(state);
        
        if (state.paused)
        {
            statePause();
        }
    }; 
}

function keyDownHandler(event)
{
    if (event.key in keysPressed)
    {
        keysPressed[event.key] = true;
        event.preventDefault();
    }
    event.preventDefault();
    if (event.key === " " && !isPaused)
    {
        isPaused = true;
        socket.send(JSON.stringify({
            toggle_pause: true,
            side: "left",
            paddle: 0
        }));
    }
    else if (event.key === " " && isPaused)
    { 
        isPaused = false;
        socket.send(JSON.stringify({ 
            toggle_pause: true,
            side: "left",
            paddle: 0
        }));
    }
}

function keyUpHandler(event)
{
    if (event.key in keysPressed)
    {
        keysPressed[event.key] = false;
        event.preventDefault();
    }
}

function playGameMulti()
{
    console.log("pause == ", isPaused);
    if (!isPaused)
    {
        if (keysPressed["w"])
        {
            socket.send(JSON.stringify({
                toggle_pause: false,
                side: "left",
                paddle: -2
            }));
        }
        if (keysPressed["s"])
        {
            socket.send(JSON.stringify({
                toggle_pause: false,
                side: "left",
                paddle: 2
            }));
        }
        if (keysPressed["ArrowUp"])
        {
            socket.send(JSON.stringify({
                toggle_pause: false,
                side: "right",
                paddle: -2
            }));
        }
        if (keysPressed["ArrowDown"])
        {
            socket.send(JSON.stringify({
                toggle_pause: false,
                side: "right",
                paddle: 2
            }));
        }
    }
}

function pauseButton()
{
    isPaused = !isPaused;
    socket.send(JSON.stringify({
        toggle_pause: true,
        side: "left",
        paddle: 0
    }));
}

function endgameButton()
{
    closeSocket();
    navigate('playerMode');
}

function playGame(mode)
{
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    isPaused = true;
    
    handleSocket();
    messageSocket();
    if (mode === "solo" || mode === "multi")
    {
        // evenement touches paddle bitch
        document.removeEventListener("keydown", keyDownHandler);
        document.addEventListener("keydown", keyDownHandler);
        document.removeEventListener("keyup", keyUpHandler);
        document.addEventListener("keyup", keyUpHandler);

        // clearinterval pour repetition des frames 
        clearInterval(interval);
        interval = setInterval(playGameMulti, 16);
        console.log("interval == ", interval);
        
        // boutton pause en plus du space
        const boutton = document.getElementById('pause');
        boutton.removeEventListener('click', pauseButton);
        boutton.addEventListener('click', pauseButton)
        // boutton endgame / fin de jeu rho --> maybe rajouter un modal ?
        const endgame = document.getElementById('endgame');
        endgame.removeEventListener('click', endgameButton);
        endgame.addEventListener('click', endgameButton)
    }
    // else if (mode === "online")
    // {
    //     document.removeEventListener("keydown", playGameOnline);
    //     document.addEventListener("keydown", playGameOnline);
    // }
}

/*
     - handle les erreurs possibles 
     - page de win et page de loose (same page pour le solo et le multi i guess) --> modal bootstrap
     - score = premier arriver jusqu'a 5
     - quand partie finie -> soit on rejoue soit on fait fin du jeu ?
*/

export default closeSocket;
