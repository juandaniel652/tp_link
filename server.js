const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000; // puerto donde correrá el servidor
const cors = require('cors');
app.use(cors());


app.use(bodyParser.json()); // para leer JSON del body

// Endpoint para recibir tickets
app.post('/api/ticket', (req, res) => {
    const { id_cliente, ticket_id, estado } = req.body;

    console.log(`Recibido ticket ${ticket_id} del cliente ${id_cliente} con estado ${estado}`);

    // Aquí podés actualizar tu base de datos o tu agenda
    // Ej: guardar turno, actualizar estado, etc.

    res.json({ mensaje: 'Ticket recibido correctamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// CREAR UN REPOSITORIO PARA USAR MEDIANTE NETLIFY LAS APIS Y LUEGO RELACIONARLAS