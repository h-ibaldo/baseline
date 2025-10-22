# API Reference

## Overview

This document provides a comprehensive reference for the Baseline API. The API is designed to be RESTful, consistent, and easy to use.

## Base URL

```
https://api.baseline.dev/v1
```

## Authentication

### API Key Authentication

Include your API key in the request header:

```http
Authorization: Bearer YOUR_API_KEY
```

### Getting an API Key

1. Sign up for a Baseline account
2. Go to your account settings
3. Generate an API key
4. Keep your API key secure and never share it publicly

## Rate Limiting

- **Free Tier**: 100 requests per hour
- **Pro Tier**: 1,000 requests per hour
- **Enterprise**: Custom limits

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Endpoints

### Projects

#### List Projects

```http
GET /projects
```

**Response:**
```json
{
  "projects": [
    {
      "id": "proj_123",
      "name": "My Website",
      "description": "A beautiful website",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z",
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 1
  }
}
```

#### Get Project

```http
GET /projects/{project_id}
```

**Response:**
```json
{
  "id": "proj_123",
  "name": "My Website",
  "description": "A beautiful website",
  "settings": {
    "theme": "default",
    "responsive": true
  },
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

#### Create Project

```http
POST /projects
```

**Request Body:**
```json
{
  "name": "My New Project",
  "description": "Project description",
  "settings": {
    "theme": "default",
    "responsive": true
  }
}
```

**Response:**
```json
{
  "id": "proj_456",
  "name": "My New Project",
  "description": "Project description",
  "settings": {
    "theme": "default",
    "responsive": true
  },
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

#### Update Project

```http
PUT /projects/{project_id}
```

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

#### Delete Project

```http
DELETE /projects/{project_id}
```

**Response:**
```json
{
  "message": "Project deleted successfully"
}
```

### Components

#### List Components

```http
GET /components
```

**Query Parameters:**
- `category` - Filter by category
- `search` - Search by name or description
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 20)

**Response:**
```json
{
  "components": [
    {
      "id": "comp_123",
      "name": "Button",
      "category": "ui",
      "description": "A customizable button component",
      "preview_url": "https://api.baseline.dev/v1/components/comp_123/preview",
      "created_at": "2023-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 50
  }
}
```

#### Get Component

```http
GET /components/{component_id}
```

**Response:**
```json
{
  "id": "comp_123",
  "name": "Button",
  "category": "ui",
  "description": "A customizable button component",
  "properties": [
    {
      "name": "text",
      "type": "string",
      "required": true,
      "default": "Click me"
    },
    {
      "name": "variant",
      "type": "enum",
      "options": ["primary", "secondary", "outline"],
      "default": "primary"
    }
  ],
  "code": {
    "html": "<button class=\"btn btn-primary\">{{text}}</button>",
    "css": ".btn { padding: 8px 16px; border: none; border-radius: 4px; }",
    "js": "// Button click handler"
  },
  "created_at": "2023-01-01T00:00:00Z"
}
```

### Themes

#### List Themes

```http
GET /themes
```

**Response:**
```json
{
  "themes": [
    {
      "id": "theme_123",
      "name": "Modern",
      "description": "A modern, clean theme",
      "preview_url": "https://api.baseline.dev/v1/themes/theme_123/preview",
      "created_at": "2023-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Theme

```http
GET /themes/{theme_id}
```

**Response:**
```json
{
  "id": "theme_123",
  "name": "Modern",
  "description": "A modern, clean theme",
  "colors": {
    "primary": "#007bff",
    "secondary": "#6c757d",
    "success": "#28a745",
    "danger": "#dc3545"
  },
  "typography": {
    "font_family": "Inter, sans-serif",
    "font_sizes": {
      "small": "14px",
      "medium": "16px",
      "large": "18px"
    }
  },
  "spacing": {
    "small": "8px",
    "medium": "16px",
    "large": "24px"
  },
  "created_at": "2023-01-01T00:00:00Z"
}
```

### Code Generation

#### Generate Code

```http
POST /generate
```

**Request Body:**
```json
{
  "project_id": "proj_123",
  "format": "html",
  "options": {
    "minify": true,
    "include_css": true,
    "include_js": true
  }
}
```

**Response:**
```json
{
  "code": {
    "html": "<!DOCTYPE html><html>...</html>",
    "css": "body { margin: 0; padding: 0; }",
    "js": "console.log('Hello, Baseline!');"
  },
  "download_url": "https://api.baseline.dev/v1/downloads/gen_123.zip",
  "expires_at": "2023-01-01T01:00:00Z"
}
```

### User Management

#### Get User Profile

```http
GET /user/profile
```

**Response:**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://api.baseline.dev/v1/avatars/user_123",
  "plan": "pro",
  "created_at": "2023-01-01T00:00:00Z"
}
```

#### Update User Profile

```http
PUT /user/profile
```

**Request Body:**
```json
{
  "name": "John Smith",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

## SDKs and Libraries

### JavaScript SDK

```bash
npm install @baseline/sdk
```

```javascript
import { Baseline } from '@baseline/sdk';

const baseline = new Baseline({
  apiKey: 'your-api-key'
});

// List projects
const projects = await baseline.projects.list();

// Create a new project
const project = await baseline.projects.create({
  name: 'My Project',
  description: 'A new project'
});

// Generate code
const code = await baseline.generate({
  projectId: project.id,
  format: 'html'
});
```

### Python SDK

```bash
pip install baseline-sdk
```

```python
from baseline import Baseline

baseline = Baseline(api_key='your-api-key')

# List projects
projects = baseline.projects.list()

# Create a new project
project = baseline.projects.create(
    name='My Project',
    description='A new project'
)

# Generate code
code = baseline.generate(
    project_id=project.id,
    format='html'
)
```

## Webhooks

### Setting Up Webhooks

```http
POST /webhooks
```

**Request Body:**
```json
{
  "url": "https://your-app.com/webhooks/baseline",
  "events": ["project.created", "project.updated"],
  "secret": "your-webhook-secret"
}
```

### Webhook Events

- `project.created` - Project created
- `project.updated` - Project updated
- `project.deleted` - Project deleted
- `code.generated` - Code generation completed

### Webhook Payload

```json
{
  "event": "project.created",
  "data": {
    "id": "proj_123",
    "name": "My Project",
    "created_at": "2023-01-01T00:00:00Z"
  },
  "timestamp": "2023-01-01T00:00:00Z"
}
```

## Changelog

### Version 1.0.0 (2023-01-01)
- Initial API release
- Project management endpoints
- Component library
- Theme system
- Code generation

### Version 1.1.0 (2023-02-01)
- Added webhook support
- Improved error handling
- New component categories
- Enhanced theme customization

## Support

### Getting Help
- [API Documentation](https://docs.baseline.dev/api)
- [GitHub Issues](https://github.com/h-ibaldo/baseline/issues)
- [Community Forum](#) (coming soon)
- Email: [api@baseline.dev](mailto:api@baseline.dev)

### Status Page
- [API Status](https://status.baseline.dev)
- [Incident History](https://status.baseline.dev/history)
- [Scheduled Maintenance](https://status.baseline.dev/schedule)
