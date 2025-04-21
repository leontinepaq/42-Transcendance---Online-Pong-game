import random
import math
import time

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
        if self.y <= self.radius or self.y >= 100 - self.radius:
            # Avoid being stuck in the border
            self.y = max(self.radius, min(self.y, 100 - self.radius))
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
    predicted_y = 50
    ai_speed = 2

    def __init__(self, use_ai=True):
        self.ball = Ball()
        self.left = Paddle()
        self.right = Paddle(right=True)
        self.score = [0, 0]
        self.use_ai = use_ai
        self.last_ai_update_time = time.time()  # ajout last maj
        self.paused = True
        self.over = False
        self.start_time = time.time()
        self.paused_time = 0
        self.last_pause_time = None
        self.total_time = 0
        self.current_exchange = 0
        self.longuest_exchange = 0
        self.reset()

    def reset(self):
        self.left.reset()
        self.right.reset()
        self.ball.reset()
        self.ai_speed = 2
        self.last_pause_time = None
        self.longuest_exchange = max(
            self.longuest_exchange, self.current_exchange)
        self.current_exchange = 0
        if self.over == False:
            self.pause()
        self.last_ai_update_time = time.time() - 1
        self.predicted_y = 50

    def move_paddle(self, side, delta):
        if side == "left":
            self.left.move(delta)
        elif side == "right":
            self.right.move(delta)

    def predict_ball_y(self):
        # Si la balle va vers la gauche
        if self.ball.velocity_x <= 0:
            # return 50 # on revient au milieu
            return self.predicted_y  # ne pas bouger

        delta_t = (100 - self.ball.x) / self.ball.velocity_x
        predicted_y = self.ball.y + self.ball.velocity_y * delta_t

        # Si la balle touche un mur, prévoir le rebond
        if predicted_y <= 0:
            predicted_y = -predicted_y  # Simulation de rebond haut
        elif predicted_y >= 100:
            predicted_y = 200 - predicted_y  # Simulation de rebond bas
        return predicted_y

    def update_ai_paddle(self):
        current_time = time.time()

        # Mise à jour de l'IA toutes les secondes
        if current_time - self.last_ai_update_time >= 1:
            self.predicted_y = self.predict_ball_y()  # Prédire la position future
            self.last_ai_update_time = current_time

        # Mouvement de l'IA vers la position prédite de la balle
        target_y = self.predicted_y
        distance_to_target = target_y - self.right.y

        # Ne bouge pas si deja proche du centre du paddle
        if abs(distance_to_target) < self.right.height / 4:
            return

        # Simule comportement humain
        reaction_chance = 0.6  # 60% chance to react to ball movement
        if random.random() < reaction_chance:
            target_y += random.uniform(-10, 10)
            if self.right.y < target_y:
                self.right.move(self.ai_speed)
            elif self.right.y > target_y:
                self.right.move(-self.ai_speed)

    def save_game_duration(self):
        if self.start_time and self.end_time:
            total_time = self.end_time - self.start_time - \
                self.paused_time
            self.total_time = total_time

    def update_score(self):
        if self.ball.x > 100:
            self.score[0] += 1
        else:
            self.score[1] += 1
        if self.score[0] >= SCORE_MAX or self.score[1] >= SCORE_MAX:
            self.over = True
            self.end_time = time.time()
            self.save_game_duration()

    def update_ball(self):
        self.ball.update()
        self.ball.bounce_top_bottom()
        if self.ball.bounce_paddle(self.left) or self.ball.bounce_paddle(self.right):
            self.current_exchange += 1
        if self.ball.is_out():
            self.update_score()
            self.reset()

    def get_state(self, sym=False):
        score = [self.score[0], self.score[1]]
        if sym:
            score = [self.score[1], self.score[0]]
        return {
            "left": self.left.get_state(sym),
            "right": self.right.get_state(sym),
            "ball": self.ball.get_state(sym),
            "paused": self.paused,
            "score": score,
            "over": self.over,
        }

    def toggle_pause(self):
        if self.paused:
            self.resume()
        else:
            self.pause()

    def resume(self):
        if self.last_pause_time:
            # Ajouter le temps passé en pause
            self.paused_time += time.time() - self.last_pause_time
        self.paused = False
        self.last_pause_time = None

    def pause(self):
        self.paused = True
        self.last_pause_time = time.time()

    def is_paused(self):
        return self.paused

    def update(self):
        if self.paused or self.over:
            return
        self.update_ball()
        if self.use_ai:
            self.update_ai_paddle()
