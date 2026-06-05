const swaggerDoc = {
  openapi: '3.0.0',
  info: {
    title: 'CampusFlow API',
    version: '1.0.0',
    description: 'University Class Routine Management System — REST API Documentation',
    contact: { name: 'CampusFlow', email: 'admin@campusflow.com' },
  },
  servers: [
    { url: 'http://localhost:5000/api', description: 'Development' },
    { url: 'https://yourdomain.com/api', description: 'Production' },
  ],
  tags: [
    { name: 'Auth',        description: 'Authentication & authorization' },
    { name: 'Routine',     description: 'Class routine management' },
    { name: 'Teachers',    description: 'Teacher management' },
    { name: 'Courses',     description: 'Course management' },
    { name: 'Rooms',       description: 'Room management' },
    { name: 'Departments', description: 'Department management' },
    { name: 'Semesters',   description: 'Semester management' },
    { name: 'Users',       description: 'User management (Admin only)' },
    { name: 'Audit',       description: 'Audit log (Admin only)' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
        description: 'HttpOnly cookie set on login',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id:       { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
          name:      { type: 'string', example: 'John Doe' },
          email:     { type: 'string', example: 'john@gmail.com' },
          role:      { type: 'string', enum: ['admin','teacher','student'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Routine: {
        type: 'object',
        properties: {
          _id:       { type: 'string' },
          dayName:   { type: 'string', enum: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] },
          startTime: { type: 'string', example: '09:00' },
          endTime:   { type: 'string', example: '09:45' },
          course:    { type: 'object', properties: { courseCode: { type: 'string' }, courseTitle: { type: 'string' } } },
          teacher:   { type: 'object', properties: { shortName: { type: 'string' }, fullName: { type: 'string' } } },
          room:      { type: 'object', properties: { roomNo: { type: 'string' } } },
          section:   { type: 'string', example: 'A' },
          levelTerm: { type: 'string', example: '1-1' },
        },
      },
      Teacher: {
        type: 'object',
        properties: {
          _id:         { type: 'string' },
          shortName:   { type: 'string', example: 'ARR' },
          fullName:    { type: 'string', example: 'AKZ Rasel Rahman' },
          designation: { type: 'string', example: 'Lecturer, CSE' },
          department:  { type: 'object' },
          email:       { type: 'string' },
        },
      },
      Course: {
        type: 'object',
        properties: {
          _id:         { type: 'string' },
          courseCode:  { type: 'string', example: 'CSE2205' },
          courseTitle: { type: 'string', example: 'Database Management Systems' },
          theory:      { type: 'number' },
          sessional:   { type: 'number' },
          credit:      { type: 'number', example: 3.75 },
        },
      },
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Error message here' },
        },
      },
      Conflict: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['room','teacher'] },
          a:    { $ref: '#/components/schemas/Routine' },
          b:    { $ref: '#/components/schemas/Routine' },
        },
      },
    },
  },

  paths: {
    // ─── AUTH ───────────────────────────────────────────────────────────────
    '/auth/register': {
      post: {
        tags: ['Auth'], summary: 'Register new user',
        description: '⚠️ Role is always set to "student". Admin role must be set manually in DB.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object', required: ['name','email','password'],
            properties: {
              name:     { type: 'string', example: 'John Doe' },
              email:    { type: 'string', example: 'john@gmail.com' },
              password: { type: 'string', example: 'secret123' },
            },
          }}},
        },
        responses: {
          201: { description: 'Registered successfully, cookies set' },
          400: { description: 'Email already exists or validation error' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'], summary: 'Login',
        description: 'Rate limited to 10 attempts per 15 minutes. Sets HttpOnly cookies on success.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object', required: ['email','password'],
            properties: {
              email:    { type: 'string', example: 'admin@gmail.com' },
              password: { type: 'string', example: '123456' },
            },
          }}},
        },
        responses: {
          200: { description: 'Login successful, cookies set', content: { 'application/json': { schema: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } } } } } },
          401: { description: 'Invalid credentials' },
          429: { description: 'Too many login attempts' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'], summary: 'Refresh access token',
        description: 'Uses refreshToken cookie to issue new access + refresh tokens (rotation).',
        responses: {
          200: { description: 'Tokens refreshed' },
          401: { description: 'Refresh token expired or invalid' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'], summary: 'Logout',
        description: 'Clears cookies and invalidates refresh token.',
        responses: { 200: { description: 'Logged out' } },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'], summary: 'Get current user', security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Current user', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          401: { description: 'Not authenticated' },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'], summary: 'Request password reset email',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' } } } } } },
        responses: { 200: { description: 'Reset link sent (always 200 to prevent email enumeration)' } },
      },
    },
    '/auth/reset-password/{token}': {
      post: {
        tags: ['Auth'], summary: 'Reset password using token from email',
        parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { password: { type: 'string', example: 'newpassword123' } } } } } },
        responses: {
          200: { description: 'Password reset successful' },
          400: { description: 'Token invalid or expired' },
        },
      },
    },
    '/auth/change-password': {
      put: {
        tags: ['Auth'], summary: 'Change password (authenticated)', security: [{ cookieAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string' } } } } } },
        responses: {
          200: { description: 'Password changed' },
          400: { description: 'Current password incorrect' },
          401: { description: 'Not authenticated' },
        },
      },
    },

    // ─── ROUTINE ─────────────────────────────────────────────────────────────
    '/routine': {
      get: {
        tags: ['Routine'], summary: 'Get all routines (public)',
        parameters: [
          { name: 'semester',   in: 'query', schema: { type: 'string' }, description: 'Filter by semester ID' },
          { name: 'department', in: 'query', schema: { type: 'string' } },
          { name: 'section',    in: 'query', schema: { type: 'string' } },
          { name: 'day',        in: 'query', schema: { type: 'string' }, example: 'Sunday' },
          { name: 'search',     in: 'query', schema: { type: 'string' }, description: 'Search by course code/title' },
          { name: 'page',       in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit',      in: 'query', schema: { type: 'integer', default: 15 } },
        ],
        responses: {
          200: { description: 'Paginated routine list', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Routine' } }, total: { type: 'integer' }, page: { type: 'integer' }, pages: { type: 'integer' } } } } } },
        },
      },
      post: {
        tags: ['Routine'], summary: 'Add new class (Admin only)', security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object', required: ['dayName','startTime','endTime','course','teacher','room','semester','levelTerm','section'],
            properties: {
              dayName: { type: 'string', example: 'Sunday' },
              startTime: { type: 'string', example: '09:00' },
              endTime: { type: 'string', example: '09:45' },
              course: { type: 'string', description: 'Course ObjectId' },
              teacher: { type: 'string', description: 'Teacher ObjectId' },
              room: { type: 'string', description: 'Room ObjectId' },
              semester: { type: 'string', description: 'Semester ObjectId' },
              department: { type: 'string' },
              levelTerm: { type: 'string', example: '1-1' },
              section: { type: 'string', example: 'A' },
            },
          }}},
        },
        responses: {
          201: { description: 'Class created' },
          401: { description: 'Not authenticated' },
          403: { description: 'Admin only' },
          409: { description: 'Conflict detected', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, conflicts: { type: 'array', items: { type: 'string' } } } } } } },
        },
      },
    },
    '/routine/conflicts': {
      get: {
        tags: ['Routine'], summary: 'Get all scheduling conflicts (Admin)', security: [{ cookieAuth: [] }],
        parameters: [{ name: 'semester', in: 'query', schema: { type: 'string' } }],
        responses: {
          200: { description: 'List of conflicts', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Conflict' } } } } },
        },
      },
    },
    '/routine/{id}': {
      put: {
        tags: ['Routine'], summary: 'Update class (Admin)', security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Updated' }, 404: { description: 'Not found' }, 409: { description: 'Conflict' } },
      },
      delete: {
        tags: ['Routine'], summary: 'Delete class (Admin)', security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' }, 404: { description: 'Not found' } },
      },
    },

    // ─── TEACHERS ────────────────────────────────────────────────────────────
    '/teachers': {
      get: {
        tags: ['Teachers'], summary: 'Get all teachers (public)',
        parameters: [
          { name: 'department', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Teacher list' } },
      },
      post: {
        tags: ['Teachers'], summary: 'Add teacher (Admin)', security: [{ cookieAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['shortName','fullName','designation','department'],
          properties: {
            shortName:   { type: 'string', example: 'ARR' },
            fullName:    { type: 'string', example: 'AKZ Rasel Rahman' },
            designation: { type: 'string', example: 'Lecturer, CSE' },
            department:  { type: 'string' },
            email:       { type: 'string' },
          },
        }}}},
        responses: { 201: { description: 'Teacher created' }, 403: { description: 'Admin only' } },
      },
    },

    // ─── COURSES ─────────────────────────────────────────────────────────────
    '/courses': {
      get: { tags: ['Courses'], summary: 'Get all courses (public)', responses: { 200: { description: 'Course list' } } },
      post: {
        tags: ['Courses'], summary: 'Add course (Admin)', security: [{ cookieAuth: [] }],
        responses: { 201: { description: 'Created' }, 403: { description: 'Admin only' } },
      },
    },

    // ─── ROOMS ───────────────────────────────────────────────────────────────
    '/rooms': {
      get: { tags: ['Rooms'], summary: 'Get all rooms (public)', responses: { 200: { description: 'Room list' } } },
      post: { tags: ['Rooms'], summary: 'Add room (Admin)', security: [{ cookieAuth: [] }], responses: { 201: { description: 'Created' } } },
    },

    // ─── DEPARTMENTS ─────────────────────────────────────────────────────────
    '/departments': {
      get: { tags: ['Departments'], summary: 'Get all departments (public)', responses: { 200: { description: 'Department list' } } },
      post: { tags: ['Departments'], summary: 'Add department (Admin)', security: [{ cookieAuth: [] }], responses: { 201: { description: 'Created' } } },
    },

    // ─── SEMESTERS ───────────────────────────────────────────────────────────
    '/semesters': {
      get: { tags: ['Semesters'], summary: 'Get all semesters', responses: { 200: { description: 'Semester list' } } },
      post: { tags: ['Semesters'], summary: 'Add semester (Admin)', security: [{ cookieAuth: [] }], responses: { 201: { description: 'Created' } } },
    },

    // ─── USERS ───────────────────────────────────────────────────────────────
    '/users': {
      get: { tags: ['Users'], summary: 'Get all users (Admin)', security: [{ cookieAuth: [] }], responses: { 200: { description: 'User list' } } },
    },

    // ─── AUDIT ───────────────────────────────────────────────────────────────
    '/audit': {
      get: { tags: ['Audit'], summary: 'Get audit logs (Admin)', security: [{ cookieAuth: [] }], responses: { 200: { description: 'Audit log list' } } },
    },
  },
}

module.exports = swaggerDoc
