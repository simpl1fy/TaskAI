const swaggerJsdoc = require("swagger-jsdoc");

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskAI API Documentation',
      version: '1.0.0',
      description: 'API Docs using Hono + swagger-jsdoc',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      },
    }
  },
  apis: ['./src/index.ts', './src/routes/*.ts'], // adjust path to your routes
});