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

function drawBall(x, y, r, ctx, canvas)
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

function playGame()
{
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    handleSocket();
    socket.onmessage = function(event)
    {
        console.log("Received: ", event);
        const state = JSON.parse(event.data);
        console.log(state);

        if (state.alert)
        {
            alert(state.message);
        };
        
        //Score
        document.getElementById("leftScore").textContent = state.score[0];
        document.getElementById("rightScore").textContent = state.score[1];

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        ctx.fillStyle = "white";
    
        // Draw ball
        drawBall(state.ball.x, state.ball.y, state.ball.r, ctx, canvas);
        // Draw paddles
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

        // Draw PAUSED text if the game is paused
        if (state.paused) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)"; // Light overlay
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
    };

    // Send paddle movement when pressing arrow keys
    document.addEventListener("keydown", (event) => {
        const keyActions = {
            "ArrowUp": { side: "right", paddle: -5 },
            "ArrowDown": { side: "right", paddle: 5 },
            "q": { side: "left", paddle: -5 },
            "a": { side: "left", paddle: 5 },
            " ": { toggle_pause: true}
        };
    
        if (keyActions[event.key]) {
            event.preventDefault();
            socket.send(JSON.stringify({
                toggle_pause: keyActions[event.key].toggle_pause || false,
                side: keyActions[event.key].side || "left",
                paddle: keyActions[event.key].paddle || 0
            }));
        }
    });

}

export default closeSocket;

// let baseWidth = 480;
// let baseHeight = 320;

// let leftUp, leftDown, rightUp, rightDown;

// const pong = document.getElementById('Pong');
// // todo: revoir la taille dinitialisaton du canvas 
// pong.innerHTML =
// `
//     <canvas id="myCanvas" width=980 height=680"></canvas>
// `;

// let canvas = document.getElementById('myCanvas');
// let ctx = canvas.getContext("2d");

// function resize()
// {
//     let canvasWidth = window.innerHeight;
//     let canvasHeight = canvasWidth * (baseHeight / baseWidth);

//     canvas.height = canvasHeight;
//     canvas.width = canvasWidth;
//     drawFont();
//     drawBall();
//     drawPaddleLeft();
//     drawPaddleRight();
// }

// function keyDownHandler(e)
// {
//     if (e.key == "ArrowDown")
//         rightDown = true;
//     else if (e.key == "ArrowUp")
//         rightUp = true;
//     if (e.key == "s" || e.key == "S")
//         leftDown = true;
//     else if (e.key == "w" || e.key == "W")
//         leftUp = true;
// }

// function keyUpHandler(e)
// {
//     if (e.key == "ArrowDown")
//         rightDown = false;
//     else if (e.key == "ArrowUp")
//         rightUp = false;
//     if (e.key == "s" || e.key == "S")
//         leftDown = false;
//     else if (e.key == "w" || e.key == "W")
//         leftUp = false;
// }

// function drawFont()
// {
//     ctx.beginPath();
//     ctx.rect(0, 0, canvas.width, canvas.height);
//     ctx.fillStyle = "#052f4d";
//     ctx.fill();
//     ctx.closePath();
// }

// function drawBall()
// {
//     ctx.beginPath();
//     ctx.arc(canvas.width / 2, canvas.height / 2, 5, 0, Math.PI * 2, false);
//     ctx.fillStyle = "#ebedee";
//     ctx.fill();
//     ctx.closePath();
// }

// function drawPaddleLeft()
// {
//     ctx.beginPath();
//     ctx.rect(10, (canvas.height / 2 - 40), 10, 80);
//     ctx.fillStyle = "rgba(9, 9, 46, 0.5)";
//     ctx.fill();
//     ctx.closePath();    
// }

// function drawPaddleRight()
// {
//     ctx.beginPath();
//     ctx.rect(canvas.width - 20, canvas.height / 2 - 40, 10, 80);
//     ctx.fillStyle = "rgba(9, 9, 46, 0.5)";
//     ctx.fill();
//     ctx.closePath(); 
// }

// function draw()
// {
//     drawFont();
//     drawBall();
//     drawPaddleLeft();
//     drawPaddleRight();
// }

// window.addEventListener('resize', function() {
//     resize();
// });
// document.addEventListener("keydown", keyDownHandler, false);
// document.addEventListener("keyup", keyUpHandler, false);

// let interval = setInterval(draw, 10);

// function send_RightPaddle()
// {
    //     if (rightUp)
    //     {
    //         socket.send(JSON.stringify({side: "1", direction: "0"}));
//     }
//     if (rightDown)
//     {
//         socket.send(JSON.stringify({side: "1", direction: "1"}));
//     }
// }

// function send_LeftPaddle()
// {
//     if (leftUp)
//     {
//         socket.send(JSON.stringify({side: "0", direction: "0"}));
//     }
//     if (leftDown)
//     {
//         socket.send(JSON.stringify({side: "0", direction: "1"}));
//     }
// }

// socket.onopen = () =>
// {
//     console.log("Connected");    
// };
    
// socket.onmessage = (event) =>
// {
//     const data = JSON.parse(event);
    
//     game_over = data.game_over;
//     xBall = data.ball[0];
//     yBall = data.ball[1];
//     y_leftPaddle = data.paddle_left;
//     y_rightPaddle = data.paddle_right;
// }

