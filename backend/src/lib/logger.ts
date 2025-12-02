/**
 * Sistema centralizado de logs para AthletIA
 * 
 * Níveis: info, warn, error, debug
 * Formato padronizado: [TIMESTAMP] [LEVEL] [MODULE] message
 * Integração com PM2 logs
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module?: string;
  message: string;
  data?: any;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, module: string | undefined, message: string): string {
    const timestamp = this.formatTimestamp();
    const moduleStr = module ? `[${module}]` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${moduleStr} ${message}`;
  }

  private log(level: LogLevel, module: string | undefined, message: string, data?: any): void {
    const moduleForFormat = data ? module : (module || undefined);
    const formattedMessage = this.formatMessage(level, moduleForFormat, message);
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    
    switch (level) {
      case 'error':
        console.error(formattedMessage + dataStr);
        break;
      case 'warn':
        console.warn(formattedMessage + dataStr);
        break;
      case 'debug':
        if (this.isDevelopment) {
          console.log(formattedMessage + dataStr);
        }
        break;
      case 'info':
      default:
        console.log(formattedMessage + dataStr);
        break;
    }
  }

  /**
   * Log de informação geral
   */
  info(message: string, module?: string, data?: any): void {
    this.log('info', module, message, data);
  }

  /**
   * Log de aviso
   */
  warn(message: string, module?: string, data?: any): void {
    this.log('warn', module, message, data);
  }

  /**
   * Log de erro
   */
  error(message: string, module?: string, error?: any): void {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack, name: error.name }
      : error;
    this.log('error', module, message, errorData);
  }

  /**
   * Log de debug (apenas em desenvolvimento)
   */
  debug(message: string, module?: string, data?: any): void {
    if (this.isDevelopment) {
      this.log('debug', module, message, data);
    }
  }
}

// Exportar instância singleton
export const logger = new Logger();

// Exportar classe para testes
export { Logger };

