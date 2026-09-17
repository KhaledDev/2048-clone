export class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.running = false;
        this._tick = this._tick.bind(this);
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    burst(x, y, color, count = 24) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 5;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 6 + Math.random() * 6,
                life: 1,
                decay: 0.012 + Math.random() * 0.015,
                color,
            });
        }

        if (!this.running) {
            this.running = true;
            requestAnimationFrame(this._tick);
        }
    }

    _tick() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.particles = this.particles.filter((p) => p.life > 0);
        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.95;
            p.vy *= 0.95;
            p.vy += 0.08;
            p.life -= p.decay;

            const radius = Math.max(p.radius * p.life, 0);
            if (radius > 0) {
                ctx.globalAlpha = Math.max(p.life, 0);
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
        ctx.globalAlpha = 1;

        if (this.particles.length > 0) {
            requestAnimationFrame(this._tick);
        } else {
            this.running = false;
        }
    }
}
