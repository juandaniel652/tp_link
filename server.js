const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Servir tus archivos HTML estáticos
app.use(express.static('html'));
app.use(express.static(__dirname)); // sirve index.html y carpetas


// Proxy para reenviar el pedido al servidor PHP remoto
app.post('/api/ticket', async (req, res) => {
  try {
    const response = await fetch('https://isp.fenixsi.ar/api/agendar_visita.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    // Reenviamos la respuesta original al frontend
    const data = await response.text(); // puede ser JSON o texto
    res.send(data);

  } catch (error) {
    console.error('Error al reenviar el ticket:', error);
    res.status(500).json({ error: 'Error al reenviar el ticket' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
