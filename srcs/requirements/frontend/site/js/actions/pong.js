import { navigate  } from "../router.js"

export const pongActions = [
    {
        selector: '[data-action="playGameSolo"]',
        handler: initGameSolo
    },
    {
        selector: '[data-action="playGameMultiplayer"]',
        handler: initGameMulti
    },
    {
        selector: '[data-action="playGameOnline"]',
        handler: initGameOnline
    },
];

let socket;
let canvas;
let ctx;

function initGameSolo()
{
    navigate('pong');
    setTimeout(function() {
        socket = new WebSocket("/ws/pong/solo/");   // solo
        playGame();
    }, 150)
}

function initGameMulti()
{
    navigate('pong');
    setTimeout(function() {
        socket = new WebSocket("/ws/pong/multi/");   // multi
        playGame();
    }, 150)
}

function initGameOnline()
{
    navigate('pong');
    setTimeout(function() {
        socket = new WebSocket("/ws/pong/online/");   // online/id --> comment specifier lid en question ? voir avec ja
        playGame();
    }, 150)
}

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

    // Draw two vertical bars for the pause sign
    const barWidth = 20; // Width of the pause bars
    const barHeight = 100; // Height of the pause bars
    const pauseX = canvas.width / 2 - 40; // X position for the first bar
    const pauseY = canvas.height / 2 - barHeight / 2; // Y position for the bars

    // Left bar
    ctx.fillRect(pauseX, pauseY, barWidth, barHeight);
    
    // Right bar
    ctx.fillRect(pauseX + 40, pauseY, barWidth, barHeight);
}

function drawBall(x, y, r)
{
    ctx.beginPath();
    ctx.arc(
        x * canvas.width / 100,  // X coordinate of the ball
        y * canvas.height / 100, // Y coordinate of the ball
        r * canvas.width / 100,  // radius of the ball
        0,                       // Starting angle
        Math.PI * 2              // Ending angle -> 360 for complete circle
    );
    ctx.fill();
};

function drawPaddle(state)
{
    ctx.fillRect(
        state.left.top_left_corner.x * canvas.width / 100,  // X coordinate of top left corner of the rectangle
        state.left.top_left_corner.y * canvas.height / 100, // Y coordinate of top left corner of the rectangle
        state.left.width * canvas.width / 100,              // Width of the rectangle
        state.left.height * canvas.height / 100             // Length of the rectangle
    );
    ctx.fillRect(
        state.right.top_left_corner.x * canvas.width / 100,  // X coordinate of top left corner of the rectangle
        state.right.top_left_corner.y * canvas.height / 100, // Y coordinate of top left corner of the rectangle
        state.right.width * canvas.width / 100,              // Width of the rectangle
        state.right.height * canvas.height / 100             // Length of the rectangle
    );
}

function messageSocket()
{
    socket.onmessage = function(event)
    {
        console.log("Received: ", event);
        const state = JSON.parse(event.data);
        console.log(state);
    
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

// function playGame()
// {
//     canvas = document.getElementById("gameCanvas");
//     ctx = canvas.getContext("2d");
    
//     handleSocket();
//     messageSocket();
    // let isPaused = false;

    // document.addEventListener("keydown", (event) => {
    //     const keyActions = {
    //         "ArrowUp": { side: "right", paddle: -2 },
    //         "ArrowDown": { side: "right", paddle: 2 },
    //         "q": { side: "left", paddle: -2 },
    //         "a": { side: "left", paddle: 2 },
    //         " ": { toggle_pause: true}
    //     };

    //     if (keyActions[event.key])
    //     {
    //         event.preventDefault();
    //         if (event.key === " " && !isPaused)
    //         {
    //             isPaused = true;
    //             socket.send(JSON.stringify({
    //                 toggle_pause: true,
    //                 side: keyActions[event.key].side || "left",
    //                 paddle: keyActions[event.key].paddle || 0
    //             }));    
    //         }
    //         else if (event.key === " " && isPaused)
    //         { 
    //             isPaused = false;
    //             socket.send(JSON.stringify({
    //                 toggle_pause: false,
    //                 side: keyActions[event.key].side || "left",
    //                 paddle: keyActions[event.key].paddle || 0
    //             }));
    //         }
    //         else
    //         {
    //             socket.send(JSON.stringify({
    //                 toggle_pause: false,
    //                 side: keyActions[event.key].side || "left",
    //                 paddle: keyActions[event.key].paddle || 0
    //             }));
    //         }
    //     }
    // });
// }

export default closeSocket;

// function messageSocket()
// {
//     socket.onmessage = function(event)
//     {
//         console.log("Received: ", event);
//         const state = JSON.parse(event.data);
//         console.log(state);
    
//         if (state.alert)
//         {
//             alert(state.message);
//         };
        
//         //Score
//         document.getElementById("leftScore").textContent = state.score[0];
//         document.getElementById("rightScore").textContent = state.score[1];
    
//         // Clear canvas
//         ctx.clearRect(0, 0, canvas.width, canvas.height); 
//         ctx.fillStyle = "white";
    
//         // Draw ball
//         drawBall(state.ball.x, state.ball.y, state.ball.r, ctx, canvas);
//         // Draw paddles
//         ctx.fillRect(
//             state.left.top_left_corner.x * canvas.width / 100,  // X coordinate of top left corner of the rectangle
//             state.left.top_left_corner.y * canvas.height / 100, // Y coordinate of top left corner of the rectangle
//             state.left.width * canvas.width / 100,              // Width of the rectangle
//             state.left.height * canvas.height / 100             // Length of the rectangle
//         );
//         ctx.fillRect(
//             state.right.top_left_corner.x * canvas.width / 100,  // X coordinate of top left corner of the rectangle
//             state.right.top_left_corner.y * canvas.height / 100, // Y coordinate of top left corner of the rectangle
//             state.right.width * canvas.width / 100,              // Width of the rectangle
//             state.right.height * canvas.height / 100             // Length of the rectangle
//         );
    
//         // Draw PAUSED text if the game is paused
//         if (state.paused) {
//             ctx.fillStyle = "rgba(255, 255, 255, 0.7)"; // Light overlay
//             ctx.fillRect(0, 0, canvas.width, canvas.height); // Transparent overlay
    
//             ctx.fillStyle = "white";
//             ctx.font = "50px Arial";
//             ctx.textAlign = "center";
    
//             // Draw two vertical bars for the pause sign
//             const barWidth = 20; // Width of the pause bars
//             const barHeight = 100; // Height of the pause bars
//             const pauseX = canvas.width / 2 - 40; // X position for the first bar
//             const pauseY = canvas.height / 2 - barHeight / 2; // Y position for the bars
    
//             // Left bar
//             ctx.fillRect(pauseX, pauseY, barWidth, barHeight);
            
//             // Right bar
//             ctx.fillRect(pauseX + 40, pauseY, barWidth, barHeight);
//         }
//     };
// }

/*
    TODO :
        - changer la vitesse de deplacement des paddles
*/

let pressedKeys = {
    "ArrowUp": false,
    "ArrowDown": false,
    "q": false,
    "a": false,
    " ": false
}

function playGame()
{
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    
    handleSocket();
    messageSocket();
    let isPaused = false;

    document.addEventListener("keydown", (event) => {
        if (pressedKeys.hasOwnProperty(event.key)) {
            pressedKeys[event.key] = false;
        }
        const keyActions = {
            // "ArrowUp": { side: "right", paddle: -2 },
            // "ArrowDown": { side: "right", paddle: 2 },
            // "q": { side: "left", paddle: -2 },
            // "a": { side: "left", paddle: 2 },
            " ": { toggle_pause: true}
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
            // else
            // {
            //     socket.send(JSON.stringify({
            //         toggle_pause: false,
            //         side: keyActions[event.key].side || "left", 
            //         paddle: keyActions[event.key].paddle || 0
            //     }));
            // }
        }
        handlePaddleMovement();
    });

    document.addEventListener("keyup", (event) => {
        if (pressedKeys.hasOwnProperty(event.key)) {
            pressedKeys[event.key] = true;
        }
    });
}

function handlePaddleMovement()
{
    if (pressedKeys["ArrowUp"])
    {
        socket.send(JSON.stringify({
            toggle_pause: false,
            side: "right",
            paddle: 2
        }));
    }
    if (pressedKeys["ArrowDown"])
    {
        socket.send(JSON.stringify({
            toggle_pause: false,
            side: "right",
            paddle: -2
        }));
    }
    if (pressedKeys["w"]) 
    {
        socket.send(JSON.stringify({
            toggle_pause: false,
            side: "left",
            paddle: 2
        }));
    }
    if (pressedKeys["s"])
    {
        socket.send(JSON.stringify({
            toggle_pause: false,
            side: "left",
            paddle: -2
        }));
    }
}
