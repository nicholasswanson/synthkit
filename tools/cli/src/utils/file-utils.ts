import fs from 'fs-extra';
import path from 'path';

export interface ExportOptions {
  format: 'json' | 'csv' | 'sql';
  output: string;
  pretty?: boolean;
  relationships?: boolean;
}

export class FileUtils {
  /**
   * Ensure directory exists, create if needed
   */
  static async ensureDir(dirPath: string): Promise<void> {
    await fs.ensureDir(dirPath);
  }

  /**
   * Write data to file in specified format
   */
  static async writeData(data: any[], options: ExportOptions): Promise<string> {
    await this.ensureDir(path.dirname(options.output));

    switch (options.format) {
      case 'json':
        return this.writeJSON(data, options);
      case 'csv':
        return this.writeCSV(data, options);
      case 'sql':
        return this.writeSQL(data, options);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  /**
   * Write data as JSON
   */
  private static async writeJSON(data: any[], options: ExportOptions): Promise<string> {
    const outputPath = options.output.endsWith('.json') 
      ? options.output 
      : path.join(options.output, 'data.json');

    const jsonContent = options.pretty 
      ? JSON.stringify(data, null, 2)
      : JSON.stringify(data);

    await fs.writeFile(outputPath, jsonContent, 'utf8');
    return outputPath;
  }

  /**
   * Write data as CSV
   */
  private static async writeCSV(data: any[], options: ExportOptions): Promise<string> {
    if (data.length === 0) {
      throw new Error('Cannot write CSV: no data provided');
    }

    const outputPath = options.output.endsWith('.csv') 
      ? options.output 
      : path.join(options.output, 'data.csv');

    // Get all unique keys from all objects
    const allKeys = new Set<string>();
    data.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });

    const headers = Array.from(allKeys);
    const csvLines: string[] = [];

    // Add header row
    csvLines.push(headers.map(h => this.escapeCsvValue(h)).join(','));

    // Add data rows
    data.forEach(item => {
      const row = headers.map(header => {
        const value = item[header];
        return this.escapeCsvValue(value);
      });
      csvLines.push(row.join(','));
    });

    await fs.writeFile(outputPath, csvLines.join('\n'), 'utf8');
    return outputPath;
  }

  /**
   * Write data as SQL INSERT statements
   */
  private static async writeSQL(data: any[], options: ExportOptions): Promise<string> {
    if (data.length === 0) {
      throw new Error('Cannot write SQL: no data provided');
    }

    const outputPath = options.output.endsWith('.sql') 
      ? options.output 
      : path.join(options.output, 'data.sql');

    // Assume table name from output file or use 'generated_data'
    const tableName = path.basename(outputPath, '.sql') || 'generated_data';
    
    // Get all unique keys from all objects
    const allKeys = new Set<string>();
    data.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });

    const columns = Array.from(allKeys);
    const sqlLines: string[] = [];

    // Add table creation comment
    sqlLines.push(`-- Generated data for table: ${tableName}`);
    sqlLines.push(`-- Columns: ${columns.join(', ')}`);
    sqlLines.push('');

    // Add INSERT statements
    data.forEach(item => {
      const values = columns.map(col => {
        const value = item[col];
        return this.escapeSqlValue(value);
      });

      const insertStatement = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
      sqlLines.push(insertStatement);
    });

    await fs.writeFile(outputPath, sqlLines.join('\n'), 'utf8');
    return outputPath;
  }

  /**
   * Escape CSV values
   */
  private static escapeCsvValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    const stringValue = String(value);
    
    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  /**
   * Escape SQL values
   */
  private static escapeSqlValue(value: any): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }

    if (typeof value === 'number') {
      return String(value);
    }

    if (typeof value === 'boolean') {
      return value ? 'TRUE' : 'FALSE';
    }

    if (value instanceof Date) {
      return `'${value.toISOString()}'`;
    }

    // String value - escape single quotes
    const stringValue = String(value);
    return `'${stringValue.replace(/'/g, "''")}'`;
  }

  /**
   * Create directory structure for a new project
   */
  static async createProjectStructure(projectPath: string, framework: string): Promise<void> {
    await this.ensureDir(projectPath);
    await this.ensureDir(path.join(projectPath, 'packs'));

    // Framework-specific directories
    switch (framework) {
      case 'nextjs':
        await this.ensureDir(path.join(projectPath, 'src', 'app'));
        await this.ensureDir(path.join(projectPath, 'public'));
        break;
      case 'react':
        await this.ensureDir(path.join(projectPath, 'src', 'components'));
        await this.ensureDir(path.join(projectPath, 'public'));
        break;
      case 'vue':
        await this.ensureDir(path.join(projectPath, 'src', 'components'));
        await this.ensureDir(path.join(projectPath, 'public'));
        break;
      default:
        await this.ensureDir(path.join(projectPath, 'src'));
        break;
    }
  }

  /**
   * Check if a path is safe to write to (not system directories)
   */
  static isSafePath(targetPath: string): boolean {
    const resolved = path.resolve(targetPath);
    const systemPaths = ['/bin', '/usr', '/etc', '/var', '/sys', '/proc'];
    
    return !systemPaths.some(sysPath => resolved.startsWith(sysPath));
  }

  /**
   * Get file size in human readable format
   */
  static async getFileSize(filePath: string): Promise<string> {
    try {
      const stats = await fs.stat(filePath);
      const bytes = stats.size;
      
      if (bytes === 0) return '0 B';
      
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Check if file exists and is readable
   */
  static async isReadable(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath, fs.constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if directory exists and is writable
   */
  static async isWritable(dirPath: string): Promise<boolean> {
    try {
      await fs.access(dirPath, fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }
}
