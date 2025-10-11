/**
 * @linebasis/blog
 *
 * Blog plugin entry point
 */

export { manifest as default } from './manifest';
export { manifest } from './manifest';

// Re-export services for programmatic access
export * as PostService from './server/services/posts';
export * as CategoryService from './server/services/categories';
export * as TagService from './server/services/tags';
