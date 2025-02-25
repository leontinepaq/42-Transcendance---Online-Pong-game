import random
import math

TOLERANCE = 0.5


class Paddle:
    height = 15
    width = 2

    def __init__(self, right=False):
        self.right = right
        self.x = 0
        self.y = 0
        self.reset()

    def reset(self):
        self.x = self.width / 2
        self.y = 50
        if self.right:
            self.x = 100 - self.width / 2

    def move(self, delta):
        self.y += delta
        if self.y < self.height / 2:
            self.y = self.height / 2
        elif self.y + self.height / 2 > 100:
            self.y = 100 - self.height / 2

    def get_state(self):
        return {
            "top_left_corner": {
                "x": self.x - self.width / 2,
                "y": self.y - self.height / 2
            },
            "center": {
                "x": self.x,
                "y": self.y
            },
            "height": self.height,
            "width": self.width
        }


class Ball:
    radius = 1
    speed = 2

    def reset(self):
        self.x = 50
        self.y = 50
        angle = random.uniform(-math.pi / 4, math.pi / 4)
        direction = random.choice([-1, 1])

        # Normalize velocity components
        self.velocity_x = direction * self.speed * math.cos(angle)
        self.velocity_y = self.speed * math.sin(angle)

    def update(self):
        self.x += self.velocity_x
        self.y += self.velocity_y

    def bounce_top_bottom(self):
        if self.y <= 0 or self.y >= 100:
            self.velocity_y *= -1
            return True
        return False

    def bounce_paddle(self, paddle: Paddle):
        if abs(self.x - paddle.x) <= (paddle.width / 2 + self.radius) \
                and abs(self.y - paddle.y) <= (paddle.height / 2):
            self.velocity_x *= -1
            hit_position = (self.y - paddle.y) / paddle.height - 0.5
            self.velocity_y = hit_position * 2.0
            return True
        return False

    def is_out(self):
        return self.x < 0 or self.x > 100

    def get_state(self):
        return {
            "x": self.x,
            "y": self.y,
            "r": self.radius
        }


class Pong:
    def __init__(self, use_ai=True):
        self.ball = Ball()
        self.left = Paddle()
        self.right = Paddle(right=True)
        self.score = [0, 0]
        self.use_ai = use_ai
        self.paused = False
        self.reset()

    def reset(self):
        self.left.reset()
        self.right.reset()
        self.ball.reset()
        self.ai_speed = 2

    def move_paddle(self, side, delta):
        if side == "left":
            self.left.move(delta)
        elif side == "right":
            self.right.move(delta)

    def update_ai_paddle(self):
        if self.use_ai and self.ball.x > 50:  # AI moves only when the ball is on its side
            reaction_chance = 0.8  # 80% chance to react to ball movement
            if random.random() < reaction_chance:
                target_y = self.ball.y + random.uniform(-7, 7)  # AI aims slightly off
                move_amount = self.ai_speed * random.uniform(0.8, 1.2)  # Imperfect speed
                if self.right.y < target_y:
                    self.right.move(move_amount)
                elif self.right.y > target_y:
                    self.right.move(-move_amount)

    def update_ball(self):
        self.ball.update()
        self.ball.bounce_top_bottom()
        self.ball.bounce_paddle(self.left)
        self.ball.bounce_paddle(self.right)
        if self.ball.is_out():
            if self.ball.x < 0:
                self.score[0] += 1
            else:
                self.score[1] += 1
            self.reset()

    def get_state(self):
        return {
            "left": self.left.get_state(),
            "right": self.right.get_state(),
            "ball": self.ball.get_state(),
            "paused": self.paused,
            "score": self.score
        }
        
    def toogle_pause(self):
        self.paused = not self.paused
        
    def is_paused(self):
        return self.paused

    def update(self):
        if self.paused:
            return
        self.update_ball()
        if self.use_ai:
            self.update_ai_paddle()
