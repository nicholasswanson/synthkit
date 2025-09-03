import { CLIConfig } from './config-loader';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class ValidationUtils {
  /**
   * Validate CLI command arguments
   */
  static validateGenerateArgs(args: {
    category?: string;
    role?: string;
    stage?: string;
    schema?: string;
    count?: number;
    id?: number;
    output?: string;
    format?: string;
  }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate count
    if (args.count !== undefined) {
      if (!Number.isInteger(args.count) || args.count < 1) {
        errors.push('Count must be a positive integer');
      }
      if (args.count > 10000) {
        warnings.push('Generating more than 10,000 records may take a while');
      }
    }

    // Validate ID (seed)
    if (args.id !== undefined) {
      if (!Number.isInteger(args.id)) {
        errors.push('ID must be an integer');
      }
    }

    // Validate stage
    if (args.stage && !['early', 'growth', 'enterprise'].includes(args.stage)) {
      errors.push('Stage must be one of: early, growth, enterprise');
    }

    // Validate role
    if (args.role && !['admin', 'support', 'user', 'guest'].includes(args.role)) {
      warnings.push('Role should typically be one of: admin, support, user, guest');
    }

    // Validate format
    if (args.format && !['json', 'csv', 'sql'].includes(args.format)) {
      errors.push('Format must be one of: json, csv, sql');
    }

    // Validate output path
    if (args.output) {
      if (args.output.includes('..')) {
        errors.push('Output path cannot contain ".." for security reasons');
      }
      if (args.output.startsWith('/') && !this.isSafeSystemPath(args.output)) {
        errors.push('Cannot write to system directories');
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate project initialization arguments
   */
  static validateInitArgs(args: {
    dir?: string;
    template?: string;
    force?: boolean;
    projectName?: string;
  }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate project name
    if (args.projectName) {
      if (!/^[a-zA-Z0-9-_]+$/.test(args.projectName)) {
        errors.push('Project name can only contain letters, numbers, hyphens, and underscores');
      }
      if (args.projectName.length > 50) {
        errors.push('Project name must be 50 characters or less');
      }
    }

    // Validate template
    if (args.template && !['basic', 'nextjs', 'react', 'vue', 'vanilla'].includes(args.template)) {
      errors.push('Template must be one of: basic, nextjs, react, vue, vanilla');
    }

    // Validate directory
    if (args.dir) {
      if (args.dir.includes('..')) {
        errors.push('Directory path cannot contain ".." for security reasons');
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate configuration object
   */
  static validateConfig(config: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config || typeof config !== 'object') {
      errors.push('Config must be a valid JSON object');
      return { valid: false, errors, warnings };
    }

    // Validate packs array
    if (!Array.isArray(config.packs)) {
      errors.push('Config "packs" must be an array');
    } else {
      if (config.packs.length === 0) {
        warnings.push('No packs configured - consider adding at least one pack');
      }
      config.packs.forEach((pack: any, index: number) => {
        if (typeof pack !== 'string') {
          errors.push(`Pack at index ${index} must be a string`);
        }
      });
    }

    // Validate scenarios
    if (config.scenarios && typeof config.scenarios !== 'object') {
      errors.push('Config "scenarios" must be an object');
    }

    // Validate generators
    if (config.generators) {
      if (typeof config.generators !== 'object') {
        errors.push('Config "generators" must be an object');
      } else {
        if (config.generators.id !== undefined && !Number.isInteger(config.generators.id)) {
          errors.push('Generator "id" must be an integer');
        }
        if (config.generators.locale && typeof config.generators.locale !== 'string') {
          errors.push('Generator "locale" must be a string');
        }
      }
    }

    // Validate MSW config
    if (config.msw) {
      if (typeof config.msw !== 'object') {
        errors.push('Config "msw" must be an object');
      } else {
        if (config.msw.enabled !== undefined && typeof config.msw.enabled !== 'boolean') {
          errors.push('MSW "enabled" must be a boolean');
        }
        if (config.msw.delay !== undefined) {
          if (typeof config.msw.delay !== 'number' || config.msw.delay < 0) {
            errors.push('MSW "delay" must be a non-negative number');
          }
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate pack structure
   */
  static validatePackStructure(pack: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!pack || typeof pack !== 'object') {
      errors.push('Pack must be a valid JSON object');
      return { valid: false, errors, warnings };
    }

    // Required fields
    const requiredFields = ['id', 'name', 'version'];
    requiredFields.forEach(field => {
      if (!pack[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate ID format
    if (pack.id && !/^[a-z0-9-]+$/.test(pack.id)) {
      errors.push('Pack ID must contain only lowercase letters, numbers, and hyphens');
    }

    // Validate version format
    if (pack.version && !/^\d+\.\d+\.\d+/.test(pack.version)) {
      warnings.push('Pack version should follow semantic versioning (e.g., 1.0.0)');
    }

    // Validate schemas
    if (!pack.schemas) {
      errors.push('Pack must have a schemas object');
    } else if (typeof pack.schemas !== 'object') {
      errors.push('Pack schemas must be an object');
    } else {
      Object.entries(pack.schemas).forEach(([schemaName, schema]) => {
        if (!schema || typeof schema !== 'object') {
          errors.push(`Invalid schema: ${schemaName}`);
        }
      });
    }

    // Validate scenarios (optional)
    if (pack.scenarios) {
      if (typeof pack.scenarios !== 'object') {
        errors.push('Pack scenarios must be an object');
      } else {
        Object.entries(pack.scenarios).forEach(([scenarioName, scenario]) => {
          if (!scenario || typeof scenario !== 'object') {
            errors.push(`Invalid scenario: ${scenarioName}`);
          }
        });
      }
    }

    // Validate personas (optional)
    if (pack.personas) {
      if (typeof pack.personas !== 'object') {
        errors.push('Pack personas must be an object');
      } else {
        Object.entries(pack.personas).forEach(([personaName, persona]) => {
          if (!persona || typeof persona !== 'object') {
            errors.push(`Invalid persona: ${personaName}`);
          }
        });
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Check if a system path is safe to write to
   */
  private static isSafeSystemPath(path: string): boolean {
    const safePaths = ['/tmp', '/var/tmp', '/home', '/Users'];
    const unsafePaths = ['/bin', '/usr', '/etc', '/var', '/sys', '/proc', '/boot'];
    
    return safePaths.some(safe => path.startsWith(safe)) && 
           !unsafePaths.some(unsafe => path.startsWith(unsafe));
  }

  /**
   * Sanitize user input for file names
   */
  static sanitizeFileName(input: string): string {
    return input
      .replace(/[^a-zA-Z0-9-_\.]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  }

  /**
   * Validate that required dependencies are available
   */
  static async validateDependencies(): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check if @synthkit/sdk is available
      require('@synthkit/sdk');
    } catch (error) {
      errors.push('@synthkit/sdk is not installed or not accessible');
    }

    // Add more dependency checks as needed

    return { valid: errors.length === 0, errors, warnings };
  }
}
