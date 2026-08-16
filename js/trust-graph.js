/**
 * CAIRN Trust Fabric — Interactive Trust Graph Canvas
 * Renders the real-time circular trust topology with central Cairn node,
 * dynamic system endpoints, and pulsating cryptographic verification beams.
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('trust-graph-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, centerX, centerY;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = canvas.width = rect.width * window.devicePixelRatio;
    height = canvas.height = rect.height * window.devicePixelRatio;
    centerX = width / 2;
    centerY = height / 2;
  }

  window.addEventListener('resize', resize);
  resize();

  // Create node topology
  const nodeCount = 14;
  const nodes = [];
  const radius = Math.min(width, height) * 0.38;

  for (let i = 0; i < nodeCount; i++) {
    const angle = (i / nodeCount) * Math.PI * 2;
    nodes.push({
      x: centerX + Math.cos(angle) * (radius * (0.85 + Math.sin(i * 1.5) * 0.15)),
      y: centerY + Math.sin(angle) * (radius * (0.85 + Math.sin(i * 1.5) * 0.15)),
      baseAngle: angle,
      speed: 0.002 * (i % 2 === 0 ? 1 : -1),
      dist: radius * (0.85 + Math.sin(i * 1.5) * 0.15),
      size: 4 + (i % 3) * 1.5,
      pulse: Math.random() * Math.PI * 2,
      active: true
    });
  }

  // Verification packets traversing lines
  const packets = [];
  function spawnPacket() {
    if (packets.length < 8) {
      const targetNode = Math.floor(Math.random() * nodes.length);
      packets.push({
        nodeIndex: targetNode,
        progress: 0,
        speed: 0.015 + Math.random() * 0.02,
        outgoing: Math.random() > 0.4
      });
    }
  }

  setInterval(spawnPacket, 600);

  let time = 0;

  function render() {
    time += 0.01;
    ctx.clearRect(0, 0, width, height);

    // 1. Draw outer boundary orbits
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.95, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(37, 98, 235, 0.15)';
    ctx.lineWidth = 1 * window.devicePixelRatio;
    ctx.setLineDash([4, 6]);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(20, 200, 166, 0.12)';
    ctx.setLineDash([2, 8]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Update and draw nodes + connection spokes
    nodes.forEach((node, idx) => {
      node.baseAngle += node.speed;
      node.x = centerX + Math.cos(node.baseAngle) * node.dist;
      node.y = centerY + Math.sin(node.baseAngle) * node.dist;
      node.pulse += 0.04;

      // Draw spoke from center to node
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(node.x, node.y);
      ctx.strokeStyle = 'rgba(37, 98, 235, 0.2)';
      ctx.lineWidth = 1 * window.devicePixelRatio;
      ctx.stroke();

      // Inter-node network mesh chords
      const nextNode = nodes[(idx + 1) % nodes.length];
      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(nextNode.x, nextNode.y);
      ctx.strokeStyle = 'rgba(20, 200, 166, 0.12)';
      ctx.lineWidth = 1 * window.devicePixelRatio;
      ctx.stroke();

      // Draw node glow & point
      const glowSize = node.size * (1 + Math.sin(node.pulse) * 0.35);
      const isTeal = idx % 3 === 0;

      ctx.beginPath();
      ctx.arc(node.x, node.y, glowSize * 2, 0, Math.PI * 2);
      ctx.fillStyle = isTeal ? 'rgba(20, 200, 166, 0.15)' : 'rgba(37, 98, 235, 0.15)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      ctx.fillStyle = isTeal ? '#14c8a6' : '#60a5fa';
      ctx.shadowColor = isTeal ? '#14c8a6' : '#2562eb';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // 3. Draw packets traveling along spokes
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.progress += p.speed;
      const target = nodes[p.nodeIndex];

      let px, py;
      if (p.outgoing) {
        px = centerX + (target.x - centerX) * p.progress;
        py = centerY + (target.y - centerY) * p.progress;
      } else {
        px = target.x - (target.x - centerX) * p.progress;
        py = target.y - (target.y - centerY) * p.progress;
      }

      ctx.beginPath();
      ctx.arc(px, py, 3.5 * window.devicePixelRatio, 0, Math.PI * 2);
      ctx.fillStyle = '#14c8a6';
      ctx.shadowColor = '#14c8a6';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      if (p.progress >= 1) {
        packets.splice(i, 1);
      }
    }

    // 4. Draw Central Cairn Trust Node Core
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24 * window.devicePixelRatio, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(37, 98, 235, 0.25)';
    ctx.shadowColor = '#2562eb';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(centerX, centerY, 15 * window.devicePixelRatio, 0, Math.PI * 2);
    ctx.fillStyle = '#061220';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2 * window.devicePixelRatio;
    ctx.fill();
    ctx.stroke();

    // Mini stacked cairn representation in center
    ctx.fillStyle = '#14c8a6';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4 * window.devicePixelRatio, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(render);
  }

  render();
});
