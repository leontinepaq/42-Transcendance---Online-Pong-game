import { navigate  } from "../router.js"

export const pongActions = [
    {
        selector: '[data-action="playGameSolo"]',
        handler: initGame
    },
    {
        selector: '[data-action="playGameMultiplayer"]',
        handler: initGame
    },
    {
        selector: '[data-action="playGameOnline"]',
        handler: initGame
    },
];

function initGame()
{
    navigate('pong');
    setTimeout(function() {
        playGame();
    }, 500)
}

export function playGame()
{
    let baseWidth = 480;
    let baseHeight = 320;
    
    let leftUp, leftDown, rightUp, rightDown;

    const pong = document.getElementById('Pong');
    // todo: revoir la taille dinitialisaton du canvas 
    pong.innerHTML =
    `
        <canvas id="myCanvas" width=980 height=680"></canvas>
    `;
    
    let canvas = document.getElementById('myCanvas');
    let ctx = canvas.getContext("2d");

    function resize()
    {
        let canvasWidth = window.innerHeight;
        let canvasHeight = canvasWidth * (baseHeight / baseWidth);

        canvas.height = canvasHeight;
        canvas.width = canvasWidth;
        drawFont();
        drawBall();
        drawPaddleLeft();
        drawPaddleRight();
    }

    function keyDownHandler(e)
    {
        if (e.key == "ArrowDown")
            rightDown = true;
        else if (e.key == "ArrowUp")
            rightUp = true;
        if (e.key == "s" || e.key == "S")
            leftDown = true;
        else if (e.key == "w" || e.key == "W")
            leftUp = true;
    }
    
    function keyUpHandler(e)
    {
        if (e.key == "ArrowDown")
            rightDown = false;
        else if (e.key == "ArrowUp")
            rightUp = false;
        if (e.key == "s" || e.key == "S")
            leftDown = false;
        else if (e.key == "w" || e.key == "W")
            leftUp = false;
    }
    
    function drawFont()
    {
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#052f4d";
        ctx.fill();
        ctx.closePath();
    }
    
    function drawBall()
    {
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 5, 0, Math.PI * 2, false);
        ctx.fillStyle = "#ebedee";
        ctx.fill();
        ctx.closePath();
    }
    
    function drawPaddleLeft()
    {
        ctx.beginPath();
        ctx.rect(10, (canvas.height / 2 - 40), 10, 80);
        ctx.fillStyle = "rgba(9, 9, 46, 0.5)";
        ctx.fill();
        ctx.closePath();    
    }
    
    function drawPaddleRight()
    {
        ctx.beginPath();
        ctx.rect(canvas.width - 20, canvas.height / 2 - 40, 10, 80);
        ctx.fillStyle = "rgba(9, 9, 46, 0.5)";
        ctx.fill();
        ctx.closePath(); 
    }
    
    function draw()
    {
        drawFont();
        drawBall();
        drawPaddleLeft();
        drawPaddleRight();
    }
    
    window.addEventListener('resize', function() {
        resize();
    });
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);

    let interval = setInterval(draw, 10);
}

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

