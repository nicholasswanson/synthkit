# Contributing to Synthkit

## Development Setup

### Prerequisites

- Node.js 20.11.0+ (see `.nvmrc`)
- pnpm 9.0.0+ (auto-installed by setup script)

### Getting Started

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/synthkit.git
cd synthkit

# Run automated setup
./scripts/setup-dev.sh

# Or manual setup
pnpm install
pnpm build
```

## Making Changes

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Follow existing code style
- Add tests for new features
- Update documentation

### 3. Validate Changes

```bash
# Run validation
pnpm validate

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

### 4. Commit

Follow conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation
- `chore:` Maintenance
- `refactor:` Code refactoring

## Dependency Management

### Adding Dependencies

1. **Package-specific dependency:**
   ```bash
   cd packages/synthkit-sdk
   pnpm add some-package
   ```

2. **Shared dependency (catalog):**
   - Add to `pnpm-workspace.yaml` catalog
   - Update package.json to use `"catalog:"`
   - Run `pnpm install`

### Updating Dependencies

1. Update version in `pnpm-workspace.yaml`
2. Run `pnpm install`
3. Test thoroughly

## Pull Request Process

1. Update documentation
2. Add/update tests
3. Run full validation suite
4. Submit PR with clear description
5. Address review feedback

## Code Style

- TypeScript for all new code
- ESLint + Prettier formatting
- Meaningful variable names
- Comment complex logic
- Keep functions small and focused

Thank you for contributing! 🎉
