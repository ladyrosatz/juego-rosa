alert("¡Hola! Este es el juego de Rosa, donde nunca podrás perder (no sabe como cuadrar el gap) :D.");

const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 600 }, debug: false }
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

let bird, pipes, score = 0, scoreText;

function preload() {
  this.load.image('background', 'background3.png');
  this.load.image('bird', 'bird.png');
  this.load.image('pipe', 'pipe.png');
}

function create() {
  const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
  background.displayWidth = this.sys.game.config.width;
  background.displayHeight = this.sys.game.config.height;

  bird = this.physics.add.sprite(100, 300, 'bird').setScale(0.1);
  bird.setCollideWorldBounds(true);
  bird.setSize(20, 20).setOffset(5, 5); // hitbox reducida

  // ✅ Usamos grupo dinámico para permitir movimiento
  pipes = this.physics.add.group();

  this.time.addEvent({
    delay: 1500,
    callback: addPipes,
    callbackScope: this,
    loop: true
  });

  this.input.keyboard.on('keydown-SPACE', () => bird.setVelocityY(-250));
  
  // 👉 Agregado para móvil (touch o click)
this.input.on('pointerdown', () => bird.setVelocityY(-250));

  // ✅ Colisión entre pájaro y tubos
  this.physics.add.overlap(bird, pipes, hitPipe, null, this);

  scoreText = this.add.text(16, 16, '0', { font: '32px Arial', fill: '#fff' });
}

function update() {
  pipes.children.iterate(pipe => {
    if (!pipe) return;
    pipe.x -= 2;
    pipe.body.updateFromGameObject(); // ✅ actualiza hitbox al mover
    if (pipe.x < -50) {
      pipes.remove(pipe, true, true);
    }
  });
}

function addPipes() {
  const gapSize = 180;
  const holeCenter = Phaser.Math.Between(150, 450);

  const pipeX = 450;
  const top = pipes.create(pipeX, holeCenter - gapSize / 2, 'pipe')
    .setFlipY(true)
    .setScale(0.15)
    .setOrigin(0.5, 1);

  const bottom = pipes.create(pipeX, holeCenter + gapSize / 2, 'pipe')
    .setScale(0.15)
    .setOrigin(0.5, 0);

  [top, bottom].forEach(pipe => {
    pipe.body.allowGravity = false;
    pipe.setImmovable(true);

    // 🎯 Alinear la hitbox a lo visible (sin parte transparente)
    const hitboxWidth = pipe.displayWidth * 0.6; // reducir un poco para ajustarse visualmente
    const offsetX = (pipe.displayWidth - hitboxWidth) / 2;
    pipe.body.setSize(hitboxWidth, pipe.displayHeight);
    pipe.body.setOffset(offsetX, 0);
  });

  score++;
  scoreText.setText(score);
}

function hitPipe() {
  console.log('💥 COLISIÓN DETECTADA 💥');
  this.physics.pause();
  bird.setTint(0xff0000);
  scoreText.setText('Game Over');

  this.input.once('pointerdown', () => {
    this.scene.restart();
  });

  this.input.keyboard.once('keydown-SPACE', () => {
    this.scene.restart();
  });
}


