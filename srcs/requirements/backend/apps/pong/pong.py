import random
import math
import time
import json


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
        self.last_ai_update_time = time.time() # ajout last maj
        self.paused = True
        self.over = False
        self.reset()

    def reset(self):
        self.left.reset()
        self.right.reset()
        self.ball.reset()
        self.ai_speed = 2
        self.last_ai_update_time = time.time()

    def move_paddle(self, side, delta):
        if side == "left":
            self.left.move(delta)
        elif side == "right":
            self.right.move(delta)
    
    def predict_ball_y(self, delta_time=1):
        predicted_y = self.ball.y + self.ball.velocity_y * delta_time

        # Si la balle touche un mur, prévoir le rebond
        if predicted_y <= 0:
            predicted_y = -predicted_y  # Simulation de rebond haut
        elif predicted_y >= 100:
            predicted_y = 200 - predicted_y  # Simulation de rebond bas

        return predicted_y
    
    predicted_y = 50

    def update_ai_paddle(self):
        global predicted_y
        current_time = time.time()

        # Mise à jour de l'IA toutes les secondes
        if current_time - self.last_ai_update_time >= 1:
            self.predicted_y = self.predict_ball_y(delta_time=1)  # Prédire la position future
            self.last_ai_update_time = current_time

        # Mouvement de l'IA vers la position prédite de la balle
        target_y = self.predicted_y
        distance_to_target = target_y - self.right.y

        # Simuler un léger retard ou une erreur humaine
        # if random.random() < 0.2:  # 20% de chance d'erreur
            # distance_to_target += random.choice([-1, 1]) * random.randint(1, 3)  # Erreur de 1 à 3 pixels

        # Déplacement du paddle de l'IA
        if abs(distance_to_target) > self.ai_speed:
            if distance_to_target > 0:
                self.right.y += self.ai_speed
            else:
                self.right.y -= self.ai_speed
        else:
            self.right.y = target_y  # Si proche, positionner directement le paddle
        
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
