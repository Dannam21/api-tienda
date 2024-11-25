const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const axios = require('axios');  // Usamos axios para llamar a la API de usuarios

exports.handler = async (event) => {
    const { tenantID, tiendaID, nombre, ubicacion, email } = JSON.parse(event.body);

    // Llamamos a la API de usuarios para verificar si el correo existe
    try {
        const userResponse = await axios.get(`https://api-usuarios.com/usuarios/fetch?tenantID=${tenantID}&email=${email}`);
        if (!userResponse.data || userResponse.data.length === 0) {
            return { 
                statusCode: 400, 
                body: JSON.stringify({ message: "El usuario con este correo no está registrado para este tenant." }) 
            };
        }
    } catch (error) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ message: "Error al verificar el usuario", error }) 
        };
    }

    const params = {
        TableName: "Tiendas",
        Item: {
            tenantID,
            tiendaID,
            nombre,
            ubicacion,
            fechaCreacion: new Date().toISOString(),
        },
    };

    try {
        await dynamoDB.put(params).promise();
        return { statusCode: 201, body: JSON.stringify({ message: "Tienda creada" }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: "Error al crear tienda", error }) };
    }
};
