# @linebasis/blog

Full-featured blog system plugin for LineBasis CMS.

## Features

- ✅ **Posts** - Create and manage blog posts with rich content
- ✅ **Categories** - Hierarchical category system
- ✅ **Tags** - Tag posts for better organization
- ✅ **SEO** - Built-in SEO metadata fields
- ✅ **Scheduling** - Schedule posts for future publication
- ✅ **Status Management** - Draft, published, scheduled, archived
- ✅ **Multi-author** - Full author attribution and management
- ✅ **RSS Feed** - Automatic RSS feed generation (configurable)

## Installation

This plugin comes bundled with LineBasis. To activate:

1. Go to `/admin/plugins`
2. Find "@linebasis/blog"
3. Click "Activate"

## Usage

### Admin Interface

Once activated, you'll see new menu items in the admin panel:

- **Posts** (`/admin/posts`) - Manage blog posts
- **Categories** (`/admin/categories`) - Manage categories
- **Tags** (`/admin/tags`) - Manage tags

### API Endpoints

**Posts:**
- `GET /api/posts` - List posts
- `POST /api/posts` - Create post
- `GET /api/posts/[id]` - Get post
- `PATCH /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post
- `POST /api/posts/[id]/publish` - Publish post
- `POST /api/posts/[id]/unpublish` - Unpublish post

**Categories:**
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category

**Tags:**
- `GET /api/tags` - List tags
- `POST /api/tags` - Create tag
- `GET /api/tags?search=query` - Search tags

### Public Routes

- `/blog` - Blog index (list of posts)
- `/blog/[slug]` - Individual post
- `/blog/category/[slug]` - Posts by category
- `/blog/tag/[slug]` - Posts by tag
- `/blog/feed.xml` - RSS feed (if enabled)

## Configuration

Configure the blog plugin in Settings > Plugins > Blog:

- **Posts per page** - Number of posts on index (default: 10)
- **Allow comments** - Enable commenting (requires comment plugin)
- **Show author** - Display author names (default: true)
- **Show publish date** - Display dates (default: true)
- **Excerpt length** - Characters in excerpts (default: 200)
- **RSS feed** - Enable RSS generation (default: true)

## Database Schema

The blog plugin adds these models:

- **Post** - Blog posts
- **Category** - Post categories (hierarchical)
- **Tag** - Post tags
- **PostCategory** - Post-category relationships
- **PostTag** - Post-tag relationships

## Hooks

The blog plugin provides these hooks for other plugins:

- `beforePostPublish` - Before a post is published
- `afterPostPublish` - After a post is published
- `beforePostDelete` - Before a post is deleted

## Development

### File Structure

```
plugins/blog/
├── manifest.ts          # Plugin configuration
├── server/
│   ├── services/        # Business logic
│   │   ├── posts.ts
│   │   ├── categories.ts
│   │   └── tags.ts
│   └── routes/          # API handlers
│       ├── posts/
│       ├── categories/
│       └── tags/
├── admin/
│   └── posts/           # Admin UI pages
├── public/
│   └── blog/            # Public blog pages
├── prisma/
│   └── schema.prisma    # Database models
├── README.md
└── package.json
```

## Version History

### 1.0.0
- Initial release
- Posts, categories, tags
- SEO metadata
- Scheduled publishing
- RSS feed support

## License

MIT - Part of the LineBasis project

## Support

- Documentation: https://docs.linebasis.org/plugins/blog
- Issues: https://github.com/linebasis/linebasis/issues
- Community: https://community.linebasis.org
