// server.js - Production-ready
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch'); // asegurate de usar v2 si usas require()

const app = express();

// 🔹 Puerto dinámico para VPS / Render
const PORT = process.env.PORT || 3000;

// 🔹 Middleware
app.use(cors()); // permitir llamadas desde frontend externo
app.use(bodyParser.json()); // parsear JSON

// 🔹 Servir archivos estáticos
// Ajustar según tu estructura de carpetas
app.use(express.static(__dirname));          // sirve index.html y carpetas raíz
app.use('/html', express.static(__dirname + '/html'));  // turnos.html y otros
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/img', express.static(__dirname + '/img'));

// 🔹 Endpoint para recibir tickets y reenviar al PHP remoto
app.post('/api/ticket', async (req, res) => {
  try {
    // Enviar JSON al endpoint PHP remoto
    const response = await fetch('https://isp.fenixsi.ar/api/agendar_visita.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    // Leer respuesta como texto (puede ser JSON o texto plano)
    const data = await response.text();

    // Reenviar respuesta al frontend
    res.send(data);

  } catch (error) {
    console.error('❌ Error al reenviar el ticket:', error);
    res.status(500).json({ error: 'Error al reenviar el ticket' });
  }
});

// 🔹 Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT} (Puerto: ${PORT})`);
});
