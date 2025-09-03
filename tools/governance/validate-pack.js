#!/usr/bin/env node

/**
 * Pack Validation Tool
 * Enforces Synthkit governance rules for pack structure and quality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Validation rules based on governance document
const REQUIRED_PACK_FIELDS = ['id', 'name', 'version', 'description', 'schemas'];
const REQUIRED_SCHEMA_FIELDS = ['type', 'properties'];
const REQUIRED_ENTITY_FIELDS = ['id'];

class PackValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  validate(packPath) {
    console.log(`🔍 Validating pack: ${packPath}`);
    
    try {
      const packFile = path.join(packPath, 'pack.json');
      if (!fs.existsSync(packFile)) {
        this.addError('Pack file not found: pack.json');
        return this.getResults();
      }

      const pack = JSON.parse(fs.readFileSync(packFile, 'utf-8'));
      
      this.validatePackStructure(pack);
      this.validateSchemas(pack.schemas || {});
      this.validateScenarios(pack.scenarios || {});
      this.validatePersonas(pack.personas || {});
      this.validateRoutes(pack.routes || {}, pack.schemas || {});
      
    } catch (error) {
      this.addError(`Failed to parse pack.json: ${error.message}`);
    }

    return this.getResults();
  }

  validatePackStructure(pack) {
    // Check required fields
    for (const field of REQUIRED_PACK_FIELDS) {
      if (!pack[field]) {
        this.addError(`Missing required field: ${field}`);
      }
    }

    // Validate version format (basic semver check)
    if (pack.version && !pack.version.match(/^\d+\.\d+\.\d+/)) {
      this.addError(`Invalid version format: ${pack.version}. Must be semver (e.g., 1.0.0)`);
    }

    // Validate ID format
    if (pack.id && !pack.id.match(/^[a-z][a-z0-9_-]*$/)) {
      this.addError(`Invalid pack ID: ${pack.id}. Must be lowercase alphanumeric with dashes/underscores`);
    }
  }

  validateSchemas(schemas) {
    if (Object.keys(schemas).length === 0) {
      this.addWarning('Pack contains no schemas');
      return;
    }

    for (const [schemaId, schema] of Object.entries(schemas)) {
      this.validateSchema(schemaId, schema);
    }
  }

  validateSchema(schemaId, schema) {
    // Check required schema fields
    for (const field of REQUIRED_SCHEMA_FIELDS) {
      if (!schema[field]) {
        this.addError(`Schema '${schemaId}' missing required field: ${field}`);
      }
    }

    // Validate schema has ID field
    if (schema.properties && !schema.properties.id) {
      this.addError(`Schema '${schemaId}' must have an 'id' field`);
    }

    // Check ID field is UUID format
    if (schema.properties?.id && schema.properties.id.format !== 'uuid') {
      this.addWarning(`Schema '${schemaId}' ID field should use format: 'uuid'`);
    }

    // Validate timestamp fields use proper format
    if (schema.properties) {
      for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
        if (fieldName.includes('At') || fieldName.includes('Date')) {
          if (fieldSchema.format !== 'date-time' && fieldSchema.format !== 'date') {
            this.addWarning(`Schema '${schemaId}' field '${fieldName}' should use date-time or date format`);
          }
        }
      }
    }

    // Check for required fields array
    if (!schema.required || !Array.isArray(schema.required)) {
      this.addWarning(`Schema '${schemaId}' should specify required fields`);
    } else if (!schema.required.includes('id')) {
      this.addError(`Schema '${schemaId}' must include 'id' in required fields`);
    }
  }

  validateScenarios(scenarios) {
    for (const [scenarioId, scenario] of Object.entries(scenarios)) {
      this.validateScenario(scenarioId, scenario);
    }
  }

  validateScenario(scenarioId, scenario) {
    const requiredFields = ['id', 'name', 'config'];
    for (const field of requiredFields) {
      if (!scenario[field]) {
        this.addError(`Scenario '${scenarioId}' missing required field: ${field}`);
      }
    }

    // Validate scenario config has seed
    if (scenario.config && typeof scenario.config.seed !== 'number') {
      this.addWarning(`Scenario '${scenarioId}' should specify a numeric seed for deterministic generation`);
    }

    // Validate volume configuration
    if (scenario.config?.volume) {
      for (const [entity, count] of Object.entries(scenario.config.volume)) {
        if (typeof count !== 'number' || count < 0) {
          this.addError(`Scenario '${scenarioId}' volume for '${entity}' must be a positive number`);
        }
      }
    }
  }

  validatePersonas(personas) {
    for (const [personaId, persona] of Object.entries(personas)) {
      this.validatePersona(personaId, persona);
    }
  }

  validatePersona(personaId, persona) {
    const requiredFields = ['id', 'name'];
    for (const field of requiredFields) {
      if (!persona[field]) {
        this.addError(`Persona '${personaId}' missing required field: ${field}`);
      }
    }

    // Validate overrides structure
    if (persona.overrides && typeof persona.overrides !== 'object') {
      this.addError(`Persona '${personaId}' overrides must be an object`);
    }
  }

  validateRoutes(routes, schemas) {
    for (const [routePath, routeConfig] of Object.entries(routes)) {
      this.validateRoute(routePath, routeConfig, schemas);
    }
  }

  validateRoute(routePath, routeConfig, schemas) {
    // Validate route path format
    if (!routePath.startsWith('/')) {
      this.addError(`Route '${routePath}' must start with '/'`);
    }

    // Validate schema reference
    if (routeConfig.schema && !schemas[routeConfig.schema]) {
      this.addError(`Route '${routePath}' references unknown schema: ${routeConfig.schema}`);
    }

    // Validate HTTP methods
    if (routeConfig.methods) {
      const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      for (const method of routeConfig.methods) {
        if (!validMethods.includes(method)) {
          this.addError(`Route '${routePath}' has invalid HTTP method: ${method}`);
        }
      }
    }
  }

  addError(message) {
    this.errors.push(message);
  }

  addWarning(message) {
    this.warnings.push(message);
  }

  getResults() {
    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node validate-pack.js <pack-directory>');
    console.log('       node validate-pack.js --all  # Validate all packs');
    process.exit(1);
  }

  const validator = new PackValidator();
  let totalErrors = 0;
  let totalWarnings = 0;

  if (args[0] === '--all') {
    // Validate all packs in the packs directory
    const packsDir = path.join(__dirname, '..', '..', 'packs');
    if (!fs.existsSync(packsDir)) {
      console.error('❌ Packs directory not found');
      process.exit(1);
    }

    const packDirs = fs.readdirSync(packsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => path.join(packsDir, dirent.name));

    console.log(`🔍 Validating ${packDirs.length} packs...\n`);

    for (const packDir of packDirs) {
      const packName = path.basename(packDir);
      const results = validator.validate(packDir);
      
      if (results.valid) {
        console.log(`✅ ${packName}: Valid`);
      } else {
        console.log(`❌ ${packName}: ${results.errors.length} errors, ${results.warnings.length} warnings`);
        
        for (const error of results.errors) {
          console.log(`   🔴 ${error}`);
        }
        
        for (const warning of results.warnings) {
          console.log(`   🟡 ${warning}`);
        }
      }

      totalErrors += results.errors.length;
      totalWarnings += results.warnings.length;
      
      // Reset validator for next pack
      validator.errors = [];
      validator.warnings = [];
      
      console.log('');
    }

  } else {
    // Validate single pack
    const packDir = path.resolve(args[0]);
    const results = validator.validate(packDir);
    
    if (results.valid) {
      console.log('✅ Pack validation passed!');
    } else {
      console.log(`❌ Pack validation failed: ${results.errors.length} errors, ${results.warnings.length} warnings\n`);
      
      for (const error of results.errors) {
        console.log(`🔴 Error: ${error}`);
      }
      
      for (const warning of results.warnings) {
        console.log(`🟡 Warning: ${warning}`);
      }
    }

    totalErrors = results.errors.length;
    totalWarnings = results.warnings.length;
  }

  // Summary
  console.log(`\n📊 Summary: ${totalErrors} errors, ${totalWarnings} warnings`);
  
  if (totalErrors > 0) {
    console.log('❌ Validation failed - please fix errors before proceeding');
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log('⚠️  Validation passed with warnings - consider addressing them');
    process.exit(0);
  } else {
    console.log('✅ All validations passed!');
    process.exit(0);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { PackValidator };
