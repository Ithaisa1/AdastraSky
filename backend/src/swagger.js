import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AdAstra Sky API",
      version: "1.0.0",
      description:
        "API de la plataforma de astroturismo premium para las Islas Canarias",
    },
    servers: [
      {
        url: "https://aadastra-sky-backend.onrender.com",
        description: "Desarrollo local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
