# Contributing to Baseline

Thank you for your interest in contributing to Baseline! This document provides guidelines and information for contributors.

## AI-Friendly Project

**Baseline is a highly vibe-coded project that welcomes AI contributions.** We believe in the power of human-AI collaboration and encourage contributions from both humans and AI systems. However, all commits must be authored by humans to maintain accountability and project ownership.

### AI Contribution Guidelines

- **AI contributions are welcome** - We embrace AI assistance in development
- **Human authorship required** - All commits must be authored by humans
- **AI tools encouraged** - Use AI for code generation, documentation, and problem-solving
- **Human oversight** - AI-generated code should be reviewed and approved by humans
- **Transparency** - Document when AI tools were used in the development process

## Getting Started

### Prerequisites
- Node.js 18.12.1 or higher
- npm 8.19.4 or higher
- Git
- A GitHub account

### Setting Up Your Development Environment

1. **Fork the repository**
   - Go to [https://github.com/h-ibaldo/baseline](https://github.com/h-ibaldo/baseline)
   - Click the "Fork" button in the top right corner

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/baseline.git
   cd baseline
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/h-ibaldo/baseline.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run type checking
npm run check

# Run tests
npm test

# Build the project
npm run build
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add your feature description"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

- Go to your fork on GitHub
- Click "New Pull Request"
- Select your feature branch
- Fill out the pull request template
- Submit the pull request

## Code Style Guidelines

### TypeScript
- Use TypeScript for all new code
- Define proper types for all functions and variables
- Use meaningful type names
- Avoid `any` type when possible

### Svelte Components
- Use PascalCase for component names
- Use kebab-case for file names
- Follow Svelte component conventions
- Use proper TypeScript types for props

### File Organization
- Place components in `src/lib/components/`
- Place utilities in `src/lib/utils/`
- Place types in `src/lib/types/`
- Export from `src/lib/index.ts`

### Naming Conventions
- **Files**: kebab-case (`my-component.svelte`)
- **Components**: PascalCase (`MyComponent`)
- **Functions**: camelCase (`myFunction`)
- **Variables**: camelCase (`myVariable`)
- **Constants**: UPPER_SNAKE_CASE (`MY_CONSTANT`)

## Commit Message Guidelines

### Format
```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build process or auxiliary tool changes
- `ai`: AI-assisted changes (use with human authorship)

### Examples
```
feat(canvas): add drag and drop functionality
fix(components): resolve layout issues on mobile
docs(setup): update installation instructions
ai(components): generate button component with AI assistance
```

## Contribution Types

### Human Contributions
- **Author**: Human developer
- **Process**: Traditional development workflow
- **Commit Format**: Standard commit messages
- **Review**: Human code review process

### AI Contributions
- **Author**: Human (AI-assisted)
- **Process**: AI generates code, human reviews and commits
- **Commit Format**: Include `ai:` prefix or mention AI assistance
- **Review**: Human review of AI-generated code
- **Example**: `ai(components): generate responsive grid system with AI assistance`

### Hybrid Contributions
- **Author**: Human (AI + Human collaboration)
- **Process**: AI and human work together iteratively
- **Commit Format**: Document both AI and human contributions
- **Review**: Collaborative review process
- **Example**: `feat(api): implement REST endpoints (AI-generated base, human-optimized)`

### AI Contribution Workflow

1. **AI Code Generation**
   - Use AI tools to generate initial code
   - Document the AI tool used in commit message
   - Example: `ai(utils): generate validation functions using ChatGPT`

2. **Human Review and Refinement**
   - Review AI-generated code for correctness
   - Refine and optimize as needed
   - Add human insights and improvements
   - Example: `refactor(utils): optimize AI-generated validation functions`

3. **Commit with Human Authorship**
   - All commits must be authored by humans
   - Include AI assistance in commit message
   - Maintain human accountability
   - Example: `feat(components): add modal component (AI-generated, human-reviewed)`

### AI Tool Recommendations

- **Code Generation**: ChatGPT, Claude, GitHub Copilot
- **Documentation**: AI writing assistants
- **Testing**: AI test generation tools
- **Code Review**: AI code analysis tools
- **Refactoring**: AI code optimization tools

### Best Practices for AI Contributions

1. **Always Review AI Code**
   - Don't commit AI-generated code without review
   - Understand what the code does
   - Test thoroughly before committing

2. **Document AI Usage**
   - Mention AI tools in commit messages
   - Explain how AI was used
   - Credit AI assistance appropriately

3. **Maintain Human Oversight**
   - Humans make final decisions
   - Humans are responsible for code quality
   - Humans ensure project alignment

4. **Iterative Improvement**
   - Use AI as a starting point
   - Refine and improve with human expertise
   - Combine AI efficiency with human creativity

## Testing Guidelines

### Unit Tests
- Write tests for utility functions
- Test component behavior
- Aim for high test coverage
- Use descriptive test names

### Integration Tests
- Test user workflows
- Test component interactions
- Test API integrations
- Test error handling

### Test Structure
```typescript
describe('ComponentName', () => {
  it('should do something specific', () => {
    // Test implementation
  });
});
```

## Documentation Guidelines

### Code Documentation
- Add JSDoc comments for functions
- Document complex logic
- Explain design decisions
- Keep comments up to date

### README Updates
- Update README for new features
- Add installation instructions
- Include usage examples
- Keep information current

### API Documentation
- Document all public APIs
- Include parameter descriptions
- Provide usage examples
- Keep documentation synchronized with code

## Pull Request Guidelines

### Before Submitting
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] Branch is up to date with main

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass
- [ ] Manual testing completed
- [ ] Edge cases considered

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## Issue Guidelines

### Reporting Bugs
- Use the bug report template
- Include steps to reproduce
- Provide expected vs actual behavior
- Include system information

### Feature Requests
- Use the feature request template
- Describe the problem you're solving
- Provide use cases
- Consider implementation complexity

### Good Issue Examples
```markdown
## Bug Report
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**System information**
- OS: [e.g. macOS]
- Browser: [e.g. Chrome]
- Version: [e.g. 22]
```

## Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Welcome newcomers
- Provide constructive feedback
- Focus on the project's goals

### Communication
- Use clear, concise language
- Be patient with questions
- Provide helpful responses
- Stay on topic

### Getting Help
- Check existing issues and discussions
- Read the documentation
- Ask questions in the community forum
- Join the Discord server (when available)

## Recognition

### Contributors
- All contributors are recognized
- Contributors are listed in the README
- Significant contributions are highlighted
- Community members are celebrated

### Contribution Types
- Code contributions
- Documentation improvements
- Bug reports
- Feature suggestions
- Community support

## Release Process

### Versioning
- Follow semantic versioning (SemVer)
- Major versions for breaking changes
- Minor versions for new features
- Patch versions for bug fixes

### Release Notes
- Document all changes
- Highlight new features
- List bug fixes
- Note breaking changes

## Getting Help

### Resources
- [GitHub Issues](https://github.com/h-ibaldo/baseline/issues)
- [Documentation](../README.md)
- [Community Forum](#) (coming soon)
- [Discord Server](#) (coming soon)

### Contact
- Project maintainer: [@h-ibaldo](https://github.com/h-ibaldo)
- Email: [ibaldostudio@gmail.com](mailto:ibaldostudio@gmail.com)

## Thank You

Thank you for contributing to Baseline! Your contributions help make this project better for everyone. We appreciate your time, effort, and dedication to the project.
