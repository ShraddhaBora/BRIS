import { useEffect, useRef } from 'react';

export default function ParticleCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;
        const particles = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Create grid lines
        const gridLines = [];
        for (let x = 0; x < window.innerWidth; x += 80) gridLines.push({ x, type: 'v' });
        for (let y = 0; y < window.innerHeight; y += 80) gridLines.push({ y, type: 'h' });

        // Create particles
        for (let i = 0; i < 55; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.3,
                vy: -Math.random() * 0.4 - 0.1,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.1,
                color: Math.random() > 0.5 ? '0, 229, 255' : '0, 132, 255',
                life: Math.random(),
                maxLife: Math.random() * 0.5 + 0.5,
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw grid
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.025)';
            ctx.lineWidth = 0.5;
            gridLines.forEach(line => {
                ctx.beginPath();
                if (line.type === 'v') {
                    ctx.moveTo(line.x, 0);
                    ctx.lineTo(line.x, canvas.height);
                } else {
                    ctx.moveTo(0, line.y);
                    ctx.lineTo(canvas.width, line.y);
                }
                ctx.stroke();
            });

            // Draw particles
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life += 0.003;

                if (p.life > p.maxLife || p.y < 0) {
                    p.x = Math.random() * canvas.width;
                    p.y = canvas.height + 10;
                    p.life = 0;
                    p.maxLife = Math.random() * 0.5 + 0.5;
                }

                const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * p.opacity;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
                ctx.fill();
            });

            animId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return <canvas ref={canvasRef} className="particle-canvas" />;
}
