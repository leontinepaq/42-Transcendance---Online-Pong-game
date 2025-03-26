import random
import math

SCORE_MAX = 3

def symetric(x):
    return 100 - x

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

    def get_state(self, sym=False):
        x = self.x
        y = self.y
        if sym:
            x = symetric(x)
        return {"top_left_corner": {"x": x - self.width / 2,
                                    "y": y - self.height / 2},
                "center": {"x": x, "y": y},
                "height": self.height,
                "width": self.width}


class Ball:
    radius = 1
    speed = 1.0

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
        if paddle.right and paddle.x - self.x > paddle.width / 2 + self.radius:
            return False
        if not paddle.right and self.x - paddle.x > paddle.width / 2 + self.radius:
            return False
        if abs(self.y - paddle.y) > (paddle.height / 2 + self.radius):
            return False
        self.velocity_x *= -1.05
        hit_position = (self.y - paddle.y) / paddle.height
        self.velocity_y = hit_position * 2.0
        return True

    def is_out(self):
        return self.x < 0 or self.x > 100

    def get_state(self, sym=False):
        x = self.x
        if sym:
            x = symetric(x)
        return {
            "x": x,
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
        self.paused = True
        self.over = False
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
        # if self.use_ai and self.ball.x > 50:  
        # AI moves only when the ball is on its side
        if self.ball.x < 60:
                return
        reaction_chance = 0.7  # 80% chance to react to ball movement
        if random.random() < reaction_chance:
            # AI aims slightly off
            target_y = self.ball.y + random.uniform(-10, 10)
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
            if self.ball.x > 100:
                self.score[0] += 1
            else:
                self.score[1] += 1
            self.reset()
        if self.score[0] >= SCORE_MAX or self.score[1] >= SCORE_MAX:
            self.over = True

    def get_state(self, sym=False):
        score=[self.score[0], self.score[1]]
        if sym:
            score=[self.score[1], self.score[0]]
        return {
            "left": self.left.get_state(sym),
            "right": self.right.get_state(sym),
            "ball": self.ball.get_state(sym),
            "paused": self.paused,
            "score": score,
            "over": self.over
        }

    def toggle_pause(self):
        self.paused = not self.paused
        
    def pause(self):
        self.paused = True

    def is_paused(self):
        return self.paused

    def update(self):
        if self.paused or self.over:
            return
        self.update_ball()
        if self.use_ai:
            self.update_ai_paddle()
