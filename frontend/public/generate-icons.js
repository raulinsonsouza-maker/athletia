// Script Node.js para gerar ícones PNG
// Execute: node generate-icons.js
// Requer: npm install canvas

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
  { name: 'mstile-150x150.png', size: 150 },
];

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fundo amarelo com bordas arredondadas
  const radius = size * 0.22;
  ctx.fillStyle = '#F9A620';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, radius);
  ctx.fill();
  
  // Letra A preta
  ctx.fillStyle = '#000000';
  ctx.font = `bold ${Math.floor(size * 0.6)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A', size / 2, size / 2);
  
  return canvas;
}

// Polyfill para roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
  };
}

// Gerar todos os ícones
sizes.forEach(({ name, size }) => {
  const canvas = drawIcon(size);
  const buffer = canvas.toBuffer('image/png');
  const filePath = path.join(__dirname, name);
  fs.writeFileSync(filePath, buffer);
  console.log(`✓ Gerado: ${name} (${size}x${size})`);
});

console.log('\n✅ Todos os ícones foram gerados com sucesso!');

