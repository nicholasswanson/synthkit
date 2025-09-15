import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { FileUtils } from '../utils/file-utils';

export const initCommand = new Command('init')
  .description('Initialize a new Synthkit project')
  .argument('[project-name]', 'Project name (optional)')
  .option('-d, --dir <directory>', 'Target directory (defaults to project name)')
  .option('-t, --template <template>', 'Project template (nextjs, react, vanilla)', 'nextjs')
  .option('-f, --force', 'Overwrite existing files')
  .option('--no-install', 'Skip dependency installation')
  .option('--no-git', 'Skip git initialization')
  .action(async (projectName?: string, options: any = {}) => {
    try {
      console.log(chalk.blue('🚀 Initializing Synthkit project...'));
      console.log();

      // Available business categories (simplified from pack system)
      const availableCategories = [
        { id: 'modaic', name: 'Modaic (Admin Dashboard)', description: 'User management and admin tools' },
        { id: 'stratus', name: 'Stratus (Cloud Platform)', description: 'Cloud infrastructure and services' },
        { id: 'forksy', name: 'Forksy (Food Delivery)', description: 'Restaurant and delivery management' },
        { id: 'pulseon', name: 'Pulseon (Fitness Platform)', description: 'Workout tracking and health data' },
        { id: 'procura', name: 'Procura (Procurement)', description: 'Supply chain and vendor management' },
        { id: 'mindora', name: 'Mindora (Mental Health)', description: 'Therapy and wellness tracking' },
        { id: 'keynest', name: 'Keynest (Property Management)', description: 'Real estate and rental management' },
        { id: 'fluxly', name: 'Fluxly (Analytics Platform)', description: 'Data analytics and reporting' },
        { id: 'brightfund', name: 'Brightfund (Nonprofit)', description: 'Donation and fundraising management' }
      ];

      // Gather project information
      const questions = [
        {
          type: 'input',
          name: 'projectName',
          message: 'Project name:',
          default: projectName || 'my-synthkit-app',
          validate: (input: string) => {
            if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
              return 'Project name can only contain letters, numbers, hyphens, and underscores';
            }
            return true;
          }
        },
        {
          type: 'list',
          name: 'template',
          message: 'Choose a template:',
          choices: [
            { name: 'Next.js (App Router + Tailwind)', value: 'nextjs' },
            { name: 'React (Vite + Tailwind)', value: 'react' },
            { name: 'Vanilla (Basic setup)', value: 'vanilla' }
          ],
          default: options.template || 'nextjs'
        },
        {
          type: 'list',
          name: 'category',
          message: 'Select primary business category:',
          choices: availableCategories.map(cat => ({
            name: `${cat.name} - ${cat.description}`,
            value: cat.id
          })),
          default: 'modaic'
        },
        {
          type: 'confirm',
          name: 'installDeps',
          message: 'Install dependencies automatically?',
          default: !options.noInstall
        },
        {
          type: 'confirm',
          name: 'initGit',
          message: 'Initialize git repository?',
          default: !options.noGit
        }
      ];
      
      const answers = await inquirer.prompt(questions as any) as {
        projectName: string;
        template: string;
        category: string;
        installDeps: boolean;
        initGit: boolean;
      };

      // Determine target directory
      const targetDir = options.dir 
        ? path.resolve(options.dir)
        : path.resolve(answers.projectName);

      // Check if directory exists and handle conflicts
      if (await fs.pathExists(targetDir)) {
        const files = await fs.readdir(targetDir);
        if (files.length > 0 && !options.force) {
          const { overwrite } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'overwrite',
              message: `Directory "${path.basename(targetDir)}" is not empty. Continue anyway?`,
              default: false
            }
          ]);

          if (!overwrite) {
            console.log(chalk.yellow('⚠️ Initialization cancelled'));
            return;
          }
        }
      }

      console.log();
      console.log(chalk.blue('📁 Creating project structure...'));

      // Create project directory and structure
      await FileUtils.createProjectStructure(targetDir, answers.template);

      // Create synth.config.json
      const config = {
        name: answers.projectName,
        version: '1.0.0',
        template: answers.template,
        category: answers.category,
        scenarios: {
          default: 'growth'
        },
        generators: {
          id: 12345,
          locale: 'en-US',
          timeZone: 'UTC'
        }
      };

      await fs.writeJSON(path.join(targetDir, 'synth.config.json'), config, { spaces: 2 });

      // Generate template files based on chosen template
      await generateTemplateFiles(targetDir, answers.template, {
        projectName: answers.projectName,
        category: answers.category,
        categoryName: availableCategories.find(c => c.id === answers.category)?.name || answers.category
      });

      console.log(chalk.green('✅ Project structure created'));

      // Initialize git if requested
      if (answers.initGit) {
        console.log(chalk.blue('📝 Initializing git repository...'));
        try {
          await fs.writeFile(path.join(targetDir, '.gitignore'), getGitIgnoreContent(answers.template));
          console.log(chalk.green('✅ Git repository initialized'));
        } catch (error) {
          console.log(chalk.yellow('⚠️ Git initialization failed (git may not be installed)'));
        }
      }

      // Success message with next steps
      console.log();
      console.log(chalk.green('🎉 Synthkit project created successfully!'));
      console.log();
      console.log(chalk.cyan('📋 Next steps:'));
      console.log(chalk.gray(`   cd ${path.basename(targetDir)}`));
      
      if (answers.installDeps) {
        console.log(chalk.gray('   Dependencies will be installed automatically...'));
      } else {
        console.log(chalk.gray('   pnpm install  # Install dependencies'));
      }
      
      if (answers.template === 'nextjs') {
        console.log(chalk.gray('   pnpm dev      # Start development server'));
        console.log(chalk.gray('   open http://localhost:3000'));
      } else if (answers.template === 'react') {
        console.log(chalk.gray('   pnpm dev      # Start development server'));
        console.log(chalk.gray('   open http://localhost:5173'));
      }
      
      console.log();
      console.log(chalk.cyan('🛠️ Synthkit commands:'));
      console.log(chalk.gray('   synthkit generate --category core --count 50'));
      console.log(chalk.gray('   synthkit list categories'));
      console.log(chalk.gray('   synthkit list schemas core'));
      console.log();
      console.log(chalk.blue('📚 Learn more: https://github.com/nicholasswanson/synthkit'));

    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

async function generateTemplateFiles(
  targetDir: string, 
  template: string, 
  context: {
    projectName: string;
    category: string;
    categoryName: string;
  }
) {
  const templatesDir = path.join(__dirname, '../templates');
  
  switch (template) {
    case 'nextjs':
      await generateNextJSTemplate(targetDir, templatesDir, context);
      break;
    case 'react':
      await generateReactTemplate(targetDir, templatesDir, context);
      break;
    case 'vanilla':
      await generateVanillaTemplate(targetDir, context);
      break;
  }
}

async function generateNextJSTemplate(
  targetDir: string, 
  templatesDir: string, 
  context: any
) {
  // Get default schema from the first pack
  const defaultSchema = getDefaultSchema(context.availablePacks, context.defaultPack);
  const packsList = context.packs.map((p: string) => `'${p}'`).join(', ');

  // Generate package.json
  const packageTemplate = await fs.readFile(path.join(templatesDir, 'nextjs-package.json'), 'utf8');
  const packageContent = packageTemplate
    .replace(/\{\{projectName\}\}/g, context.projectName)
    .replace(/\{\{defaultPack\}\}/g, context.defaultPack);
  await fs.writeFile(path.join(targetDir, 'package.json'), packageContent);

  // Generate next.config.js
  const nextConfigTemplate = await fs.readFile(path.join(templatesDir, 'nextjs-next.config.js'), 'utf8');
  const nextConfigContent = nextConfigTemplate
    .replace(/\{\{packsList\}\}/g, packsList)
    .replace(/\{\{defaultPack\}\}/g, context.defaultPack);
  await fs.writeFile(path.join(targetDir, 'next.config.js'), nextConfigContent);

  // Generate app structure
  const appDir = path.join(targetDir, 'src', 'app');
  await fs.ensureDir(appDir);

  // Generate layout.tsx
  const layoutTemplate = await fs.readFile(path.join(templatesDir, 'nextjs-app-layout.tsx'), 'utf8');
  const layoutContent = layoutTemplate.replace(/\{\{projectName\}\}/g, context.projectName);
  await fs.writeFile(path.join(appDir, 'layout.tsx'), layoutContent);

  // Generate page.tsx
  const pageTemplate = await fs.readFile(path.join(templatesDir, 'nextjs-app-page.tsx'), 'utf8');
  const pageContent = pageTemplate
    .replace(/\{\{projectName\}\}/g, context.projectName)
    .replace(/\{\{defaultSchema\}\}/g, defaultSchema);
  await fs.writeFile(path.join(appDir, 'page.tsx'), pageContent);

  // Generate globals.css
  const cssTemplate = await fs.readFile(path.join(templatesDir, 'nextjs-globals.css'), 'utf8');
  await fs.writeFile(path.join(appDir, 'globals.css'), cssTemplate);

  // Generate tailwind.config.js
  const tailwindTemplate = await fs.readFile(path.join(templatesDir, 'nextjs-tailwind.config.js'), 'utf8');
  await fs.writeFile(path.join(targetDir, 'tailwind.config.js'), tailwindTemplate);

  // Generate tsconfig.json
  const tsconfigTemplate = await fs.readFile(path.join(templatesDir, 'nextjs-tsconfig.json'), 'utf8');
  await fs.writeFile(path.join(targetDir, 'tsconfig.json'), tsconfigTemplate);

  // Generate postcss.config.js
  const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
  await fs.writeFile(path.join(targetDir, 'postcss.config.js'), postcssConfig);
}

async function generateReactTemplate(
  targetDir: string, 
  templatesDir: string, 
  context: any
) {
  // Generate package.json
  const packageTemplate = await fs.readFile(path.join(templatesDir, 'react-package.json'), 'utf8');
  const packageContent = packageTemplate
    .replace(/\{\{projectName\}\}/g, context.projectName)
    .replace(/\{\{defaultPack\}\}/g, context.defaultPack);
  await fs.writeFile(path.join(targetDir, 'package.json'), packageContent);

  // Generate basic React structure
  const srcDir = path.join(targetDir, 'src');
  await fs.ensureDir(srcDir);

  // Generate basic App.tsx
  const appContent = `import { useState, useEffect } from 'react'
import { SynthProvider, PersonaScenarioSwitcher } from '@synthkit/client'
import './App.css'

function App() {
  return (
    <SynthProvider>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            ${context.projectName}
          </h1>
          <PersonaScenarioSwitcher />
          <div className="mt-8 p-6 bg-white rounded-lg shadow">
            <p className="text-gray-600">
              Your Synthkit React app is ready! Configure scenarios above and start building.
            </p>
          </div>
        </div>
      </div>
    </SynthProvider>
  )
}

export default App`;
  await fs.writeFile(path.join(srcDir, 'App.tsx'), appContent);

  // Generate basic CSS
  const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`;
  await fs.writeFile(path.join(srcDir, 'App.css'), cssContent);
}

async function generateVanillaTemplate(targetDir: string, context: any) {
  // Generate basic package.json
  const packageContent = {
    name: context.projectName,
    version: '1.0.0',
    description: 'Synthkit vanilla project',
    main: 'index.js',
    scripts: {
      'synth:generate': `synthkit generate --category ${context.defaultPack} --count 50 --pretty`,
      'synth:list': 'synthkit list categories'
    },
    dependencies: {
      '@synthkit/sdk': 'workspace:*'
    }
  };
  await fs.writeJSON(path.join(targetDir, 'package.json'), packageContent, { spaces: 2 });

  // Generate basic index.js
  const indexContent = `// ${context.projectName} - Synthkit Vanilla Project
import { SchemaGenerator } from '@synthkit/sdk';

console.log('🎭 Synthkit project initialized!');
console.log('Run "synthkit generate --category ${context.defaultPack} --count 10" to generate data');

const generator = new SchemaGenerator();
// Add your code here
`;
  await fs.writeFile(path.join(targetDir, 'index.js'), indexContent);
}

function getDefaultSchema(availablePacks: any[], defaultPack: string): string {
  const pack = availablePacks.find(p => p.id === defaultPack);
  if (pack && pack.pack && pack.pack.schemas) {
    const schemas = Object.keys(pack.pack.schemas);
    return schemas[0] || 'users';
  }
  return 'users'; // fallback
}

function getGitIgnoreContent(template: string): string {
  const common = `# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
.next/
out/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Dependency directories
node_modules/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Synthkit generated data
generated-data/
*.json
*.csv
*.sql
!synth.config.json
!package.json
!tsconfig.json
`;

  if (template === 'nextjs') {
    return common + `
# Next.js
.next/
out/
next-env.d.ts
`;
  }

  if (template === 'react') {
    return common + `
# Vite
dist/
.vite/
`;
  }

  return common;
}