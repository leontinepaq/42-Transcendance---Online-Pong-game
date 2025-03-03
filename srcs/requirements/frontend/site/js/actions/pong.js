import { navigate  } from "../router.js"

export const pongActions = [
    {
        selector: '[data-action="playGameSolo"]',
        handler: initGameSolo
    },
    // {
    //     selector: '[data-action="playGameMultiplayer"]',
    //     handler: initGameMulti
    // },
    // {
    //     selector: '[data-action="playGameOnline"]',
    //     handler: initGameOnline
    // },
];

let socket;
let canvas;
let ctx;

function initGameSolo()
{
    navigate('pong');
    setTimeout(function() {
        socket = new WebSocket("/ws/pong/solo/");   // solo
        playGameSolo();
    }, 150)
}

// function initGameMulti()
// {
//     navigate('pong');
//     setTimeout(function() {
//         socket = new WebSocket("/ws/pong/multi/");   // multi
//         playGame();
//     }, 150)
// }

// function initGameOnline()
// {
//     navigate('pong');
//     setTimeout(function() {
//         socket = new WebSocket("/ws/pong/online/");   // online/id --> comment specifier lid en question ? voir avec ja
//         playGame();
//     }, 150)
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
    ctx.fillStyle = "rgba(70, 22, 22, 0.7)"; // Light overlay
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Transparent overlay

    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.textAlign = "center";

    const barWidth = 20;
    const barHeight = 100;
    const pauseX = canvas.width / 2 - 40;
    const pauseY = canvas.height / 2 - barHeight / 2;

    ctx.fillRect(pauseX, pauseY, barWidth, barHeight);
    ctx.fillRect(pauseX + 40, pauseY, barWidth, barHeight);
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

function messageSocket() 
{
    socket.onmessage = function(event)
    {
        console.log("Received: ", event);
        const state = JSON.parse(event.data);
        console.log(state.paused);
    
        if (state.alert)
        {
            alert(state.message);
        };
        
        document.getElementById("leftScore").textContent = state.score[0];
        document.getElementById("rightScore").textContent = state.score[1];
    
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

function playGameSolo()
{
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    
    handleSocket();
    messageSocket();
    let isPaused = true;

    document.addEventListener("keydown", (event) => {
        const keyActions = {
            "ArrowUp": { side: "right", paddle: -2 },
            "ArrowDown": { side: "right", paddle: 2 },
            " ": { toggle_pause: false}
        };
        
        if (keyActions[event.key])
        {
            event.preventDefault();
            if (event.key === " " && !isPaused)
            {
                isPaused = true;
                socket.send(JSON.stringify({
                    toggle_pause: true,
                    side: keyActions[event.key].side || "left",
                    paddle: keyActions[event.key].paddle || 0
                }));    
            }
            else if (event.key === " " && isPaused)
            { 
                isPaused = false;
                socket.send(JSON.stringify({ 
                    toggle_pause: false,
                    side: keyActions[event.key].side || "left",
                    paddle: keyActions[event.key].paddle || 0
                }));
            }
            else
            {
                socket.send(JSON.stringify({
                    toggle_pause: false,
                    side: keyActions[event.key].side || "left",
                    paddle: keyActions[event.key].paddle || 0
                }));
            }
        }
    });
}

/*
    - est ce que tout est reset quand la connexion websocket se ferme ?
*/

export default closeSocket;

