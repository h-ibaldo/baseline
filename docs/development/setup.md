# Development Setup

## Prerequisites

Before setting up the Baseline project, ensure you have the following installed:

- **Node.js**: Version 18.12.1 or higher
- **npm**: Version 8.19.4 or higher
- **Git**: Latest version
- **Code Editor**: VS Code (recommended) or any modern editor

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/h-ibaldo/baseline.git
cd baseline
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The development server will start on `http://localhost:5173`

## Development Commands

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run check

# Type checking in watch mode
npm run check:watch
```

### Development Workflow

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Make changes to the code**
   - Edit files in the `src/` directory
   - Changes will be automatically reflected in the browser

3. **Run type checking**
   ```bash
   npm run check
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```
baseline/
├── src/
│   ├── routes/           # SvelteKit routes and pages
│   │   ├── +layout.svelte
│   │   └── +page.svelte
│   ├── lib/              # Reusable components and utilities
│   │   ├── assets/       # Static assets
│   │   └── index.ts      # Library exports
│   ├── app.html          # HTML template
│   └── app.d.ts          # Global type definitions
├── static/               # Static assets
├── docs/                 # Documentation
├── package.json          # Project configuration
├── svelte.config.js      # SvelteKit configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## Code Organization

### Components
- Place reusable components in `src/lib/components/`
- Use TypeScript for type safety
- Follow Svelte component conventions

### Pages
- Create new pages in `src/routes/`
- Use SvelteKit file-based routing
- Implement proper TypeScript types

### Utilities
- Place utility functions in `src/lib/utils/`
- Export from `src/lib/index.ts`
- Write unit tests for utilities

### Types
- Define TypeScript types in `src/lib/types/`
- Use global types in `src/app.d.ts`
- Export types from `src/lib/index.ts`

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow Svelte component conventions
- Use meaningful variable and function names
- Add comments for complex logic

### File Naming
- Use kebab-case for file names
- Use PascalCase for component names
- Use camelCase for utility functions

### Git Workflow
- Create feature branches for new features
- Write descriptive commit messages
- Use pull requests for code review
- Keep commits focused and atomic

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests
- Write unit tests for utilities
- Write component tests for UI components
- Write integration tests for user flows
- Aim for high test coverage

## Debugging

### Development Tools
- Use browser developer tools
- Enable source maps for debugging
- Use VS Code debugging features
- Check console for errors

### Common Issues
- **Port already in use**: Change port in `vite.config.ts`
- **Type errors**: Run `npm run check` to identify issues
- **Build errors**: Check for syntax errors and missing imports

## Environment Configuration

### Environment Variables
Create a `.env` file for local development:

```env
# Development settings
NODE_ENV=development
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true
```

### Configuration Files
- `svelte.config.js`: SvelteKit configuration
- `vite.config.ts`: Vite build configuration
- `tsconfig.json`: TypeScript configuration
- `package.json`: Project dependencies and scripts

## Performance Optimization

### Development
- Use hot module replacement
- Enable source maps for debugging
- Optimize bundle size
- Monitor performance metrics

### Production
- Enable code splitting
- Optimize images and assets
- Use CDN for static assets
- Implement caching strategies

## Troubleshooting

### Common Problems

1. **Node.js version issues**
   - Ensure Node.js 18.12.1+ is installed
   - Use `nvm` to manage Node.js versions

2. **Dependency conflicts**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

3. **Port conflicts**
   - Change port in `vite.config.ts`
   - Use `npm run dev -- --port 3000`

4. **TypeScript errors**
   - Run `npm run check` to identify issues
   - Check `tsconfig.json` configuration

### Getting Help
- Check the [GitHub Issues](https://github.com/h-ibaldo/baseline/issues)
- Join the community discussions
- Read the documentation
- Ask questions in the community forum

## Contributing

### Before Contributing
1. Read the [Contributing Guidelines](../CONTRIBUTING.md)
2. Check existing issues and pull requests
3. Fork the repository
4. Create a feature branch

### Development Process
1. Make your changes
2. Write tests for new features
3. Update documentation
4. Submit a pull request

### Code Review
- All code must be reviewed before merging
- Follow the established coding standards
- Ensure tests pass
- Update documentation as needed
