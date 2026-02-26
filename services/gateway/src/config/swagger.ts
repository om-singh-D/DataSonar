import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DataSonar API',
      version: '1.0.0',
      description: 'Real-time data pipeline quality monitoring & anomaly detection platform',
      contact: {
        name: 'Om Singh',
        url: 'https://github.com/om-singh-D/DataSonar',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Local development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@datasonar.io' },
            password: { type: 'string', minLength: 8, example: 'SecurePass1!' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'EDITOR', 'VIEWER'] },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthTokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            expiresIn: { type: 'string', example: '24h' },
          },
        },
        Pipeline: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            sourceType: { type: 'string', enum: ['database', 'api', 'file', 'stream', 'webhook'] },
            sourceConfig: { type: 'object' },
            status: { type: 'string', enum: ['ACTIVE', 'PAUSED', 'ERROR', 'UNKNOWN'] },
            eventCount: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreatePipelineRequest: {
          type: 'object',
          required: ['name', 'sourceType', 'sourceConfig'],
          properties: {
            name: { type: 'string', pattern: '^[a-z0-9-]+$', example: 'orders-etl' },
            description: { type: 'string' },
            sourceType: { type: 'string', enum: ['database', 'api', 'file', 'stream', 'webhook'] },
            sourceConfig: { type: 'object' },
          },
        },
      },
    },
    paths: {
      '/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterRequest' },
              },
            },
          },
          responses: {
            '201': {
              description: 'User registered',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      data: {
                        type: 'object',
                        properties: {
                          user: { $ref: '#/components/schemas/User' },
                          tokens: { $ref: '#/components/schemas/AuthTokens' },
                        },
                      },
                    },
                  },
                },
              },
            },
            '400': { description: 'Validation error' },
            '409': { description: 'Email already registered' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
              },
            },
          },
          responses: {
            '200': { description: 'Login successful' },
            '401': { description: 'Invalid credentials' },
          },
        },
      },
      '/auth/profile': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current user profile',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'User profile' },
            '401': { description: 'Unauthorized' },
          },
        },
      },
      '/pipelines': {
        get: {
          tags: ['Pipelines'],
          summary: 'List all pipelines',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'PAUSED', 'ERROR', 'UNKNOWN'] } },
          ],
          responses: {
            '200': { description: 'Pipeline list with pagination' },
          },
        },
        post: {
          tags: ['Pipelines'],
          summary: 'Create a new pipeline',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreatePipelineRequest' },
              },
            },
          },
          responses: {
            '201': { description: 'Pipeline created' },
            '409': { description: 'Pipeline name already exists' },
          },
        },
      },
    },
  },
  apis: [], // We defined paths inline above
};

export const swaggerSpec = swaggerJsdoc(options);