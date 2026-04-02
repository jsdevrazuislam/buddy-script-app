import { Options } from 'swagger-jsdoc';

const port = process.env.PORT || 9000;

const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Social Feed API',
      version: '1.0.0',
      description:
        'REST API documentation for the Social Feed Application. All protected endpoints require a Bearer JWT token.',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${port}/api/v1`,
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        // ── Auth ──────────────────────────────────────────────────────────
        RegisterRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', minLength: 6, example: 'secret123' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', example: 'secret123' },
          },
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        LogoutRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        AuthTokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        // ── Post ─────────────────────────────────────────────────────────
        CreatePostRequest: {
          type: 'object',
          required: ['text'],
          properties: {
            text: { type: 'string', example: 'Hello world!' },
            imageUrl: {
              type: 'string',
              format: 'uri',
              example: 'https://res.cloudinary.com/demo/image.jpg',
            },
            visibility: { type: 'string', enum: ['PUBLIC', 'PRIVATE'], example: 'PUBLIC' },
          },
        },
        Post: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            text: { type: 'string' },
            imageUrl: { type: 'string', nullable: true },
            visibility: { type: 'string', enum: ['PUBLIC', 'PRIVATE'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        FeedResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Post' },
            },
            nextCursor: { type: 'string', nullable: true },
          },
        },
        UploadUrlResponse: {
          type: 'object',
          properties: {
            uploadUrl: { type: 'string', format: 'uri' },
            publicId: { type: 'string' },
          },
        },
        // ── Comment ──────────────────────────────────────────────────────
        CreateCommentRequest: {
          type: 'object',
          required: ['postId', 'text'],
          properties: {
            postId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            text: { type: 'string', example: 'Great post!' },
          },
        },
        CreateReplyRequest: {
          type: 'object',
          required: ['text'],
          properties: {
            text: { type: 'string', example: 'Thanks!' },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            text: { type: 'string' },
            postId: { type: 'string', format: 'uuid' },
            parentId: { type: 'string', format: 'uuid', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // ── Like ─────────────────────────────────────────────────────────
        ToggleLikeRequest: {
          type: 'object',
          required: ['postId'],
          properties: {
            postId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
          },
        },
        ToggleLikeResponse: {
          type: 'object',
          properties: {
            liked: { type: 'boolean' },
            likesCount: { type: 'integer' },
          },
        },
        // ── Common ───────────────────────────────────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      // ── AUTH ─────────────────────────────────────────────────────────────
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          security: [],
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
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: { $ref: '#/components/schemas/AuthTokens' },
                        },
                      },
                    ],
                  },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
            '409': {
              description: 'Email already exists',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login with email & password',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: { $ref: '#/components/schemas/AuthTokens' },
                        },
                      },
                    ],
                  },
                },
              },
            },
            '400': {
              description: 'Invalid credentials or validation error',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
          },
        },
      },
      '/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh access token',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RefreshTokenRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'New access token issued',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: { $ref: '#/components/schemas/AuthTokens' },
                        },
                      },
                    ],
                  },
                },
              },
            },
            '401': {
              description: 'Invalid or expired refresh token',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout and invalidate refresh token',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LogoutRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Logged out successfully',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } },
              },
            },
          },
        },
      },
      // ── POSTS ─────────────────────────────────────────────────────────────
      '/posts': {
        post: {
          tags: ['Posts'],
          summary: 'Create a new post',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreatePostRequest' },
              },
            },
          },
          responses: {
            '201': {
              description: 'Post created successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        type: 'object',
                        properties: { data: { $ref: '#/components/schemas/Post' } },
                      },
                    ],
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
          },
        },
        get: {
          tags: ['Posts'],
          summary: 'Get paginated feed',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'query',
              name: 'cursor',
              schema: { type: 'string' },
              description: 'Cursor for pagination (last seen post ID)',
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer', default: 10 },
              description: 'Number of posts to return',
            },
          ],
          responses: {
            '200': {
              description: 'Feed retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        type: 'object',
                        properties: { data: { $ref: '#/components/schemas/FeedResponse' } },
                      },
                    ],
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
          },
        },
      },
      '/posts/upload-url': {
        get: {
          tags: ['Posts'],
          summary: 'Get a pre-signed Cloudinary upload URL',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Upload URL generated',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        type: 'object',
                        properties: { data: { $ref: '#/components/schemas/UploadUrlResponse' } },
                      },
                    ],
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
          },
        },
      },
      '/posts/{id}': {
        get: {
          tags: ['Posts'],
          summary: 'Get a single post by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Post UUID',
            },
          ],
          responses: {
            '200': {
              description: 'Post retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        type: 'object',
                        properties: { data: { $ref: '#/components/schemas/Post' } },
                      },
                    ],
                  },
                },
              },
            },
            '404': {
              description: 'Post not found',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
          },
        },
      },
      // ── COMMENTS ──────────────────────────────────────────────────────────
      '/comments': {
        post: {
          tags: ['Comments'],
          summary: 'Create a comment on a post',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateCommentRequest' },
              },
            },
          },
          responses: {
            '201': {
              description: 'Comment created',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        type: 'object',
                        properties: { data: { $ref: '#/components/schemas/Comment' } },
                      },
                    ],
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
          },
        },
      },
      '/comments/{id}/replies': {
        post: {
          tags: ['Comments'],
          summary: 'Reply to an existing comment',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Parent comment UUID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateReplyRequest' },
              },
            },
          },
          responses: {
            '201': {
              description: 'Reply created',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        type: 'object',
                        properties: { data: { $ref: '#/components/schemas/Comment' } },
                      },
                    ],
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
          },
        },
      },
      '/comments/post/{postId}': {
        get: {
          tags: ['Comments'],
          summary: 'Get all comments for a post',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'postId',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Post UUID',
            },
          ],
          responses: {
            '200': {
              description: 'Comments retrieved',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        type: 'object',
                        properties: {
                          data: { type: 'array', items: { $ref: '#/components/schemas/Comment' } },
                        },
                      },
                    ],
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
          },
        },
      },
      // ── LIKES ─────────────────────────────────────────────────────────────
      '/likes/toggle': {
        post: {
          tags: ['Likes'],
          summary: 'Toggle like on a post',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ToggleLikeRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Like toggled',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/SuccessResponse' },
                      {
                        type: 'object',
                        properties: { data: { $ref: '#/components/schemas/ToggleLikeResponse' } },
                      },
                    ],
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
          },
        },
      },
    },
  },
  // No `apis` needed — the full spec is defined inline above
  apis: [],
};

export default swaggerOptions;
