import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Logger } from '../logger';

describe('Logger', () => {
  let logger: Logger;
  let consoleDebugSpy: any;
  let consoleInfoSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    // Reset environment
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_LOG_LEVEL = 'info';
    
    // Create spies
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Create new logger instance
    logger = new Logger();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log info messages', () => {
    logger.info('Test message');
    expect(consoleInfoSpy).toHaveBeenCalled();
    expect(consoleInfoSpy.mock.calls[0][0]).toMatch(/\[INFO\] Test message/);
  });

  it('should not log debug messages when level is info', () => {
    logger.debug('Debug message');
    expect(consoleDebugSpy).not.toHaveBeenCalled();
  });

  it('should log error messages with context', () => {
    const error = new Error('Test error');
    logger.error('Error occurred', error, { userId: '123' });
    
    expect(consoleErrorSpy).toHaveBeenCalled();
    const logMessage = consoleErrorSpy.mock.calls[0][0];
    expect(logMessage).toMatch(/\[ERROR\] Error occurred/);
    expect(logMessage).toMatch(/Test error/);
    expect(logMessage).toMatch(/userId/);
  });

  it('should respect log levels', () => {
    process.env.NEXT_PUBLIC_LOG_LEVEL = 'error';
    const errorLogger = new Logger();
    
    errorLogger.debug('Debug');
    errorLogger.info('Info');
    errorLogger.warn('Warning');
    errorLogger.error('Error');
    
    expect(consoleDebugSpy).not.toHaveBeenCalled();
    expect(consoleInfoSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
