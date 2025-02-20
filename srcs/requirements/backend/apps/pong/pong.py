import random

class Pong:
    def __init__(self, use_ai=True):
        """Initialize game with AI or two-player mode."""
        self.use_ai = use_ai
        self.reset_game()

    def reset_game(self):
        """Reset game state at the start or after scoring."""
        self.ball_x, self.ball_y = 50, 50
        self.velocity_x = random.choice([-5, 5])
        self.velocity_y = random.choice([-3, 3])
        self.paddle_left = 50
        self.paddle_right = 50
        self.ai_speed = 4  # AI movement speed

    def move_paddle(self, side, new_y):
        """Move paddle within bounds."""
        if side == "left":
            self.paddle_left = max(0, min(100, new_y))
        elif side == "right":
            self.paddle_right = max(0, min(100, new_y))

    def update_ai_paddle(self):
        """Move AI paddle toward the ball with some delay."""
        if self.use_ai and self.ball_x > 50:  # AI moves only when ball is on its side
            if self.paddle_right < self.ball_y:
                self.paddle_right += self.ai_speed
            elif self.paddle_right > self.ball_y:
                self.paddle_right -= self.ai_speed

    def update_ball(self):
        """Move the ball and check for collisions."""
        self.ball_x += self.velocity_x
        self.ball_y += self.velocity_y

        # Ball bounces off top/bottom walls
        if self.ball_y <= 0 or self.ball_y >= 100:
            self.velocity_y *= -1

        # Ball hits left paddle
        if self.ball_x <= 5 and abs(self.ball_y - self.paddle_left) < 10:
            self.velocity_x *= -1

        # Ball hits right paddle
        if self.ball_x >= 95 and abs(self.ball_y - self.paddle_right) < 10:
            self.velocity_x *= -1

        # Ball goes out of bounds (scoring)
        if self.ball_x < 0 or self.ball_x > 100:
            self.reset_game()

    def get_state(self):
        """Return the current game state."""
        return {
            "ball_x": self.ball_x,
            "ball_y": self.ball_y,
            "paddle_left": self.paddle_left,
            "paddle_right": self.paddle_right,
        }

    def update(self):
        """Main game update function (called every frame)."""
        self.update_ball()
        if self.use_ai:
            self.update_ai_paddle()
