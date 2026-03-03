import { logger, accessLogger } from './utils/logger';
import util from 'util';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const http = await import('http');
    // 1. Intercept console logs
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleInfo = console.info;

    console.log = function (...args: any[]) {
      logger.info(util.format(...args));
      originalConsoleLog.apply(console, args);
    };

    console.error = function (...args: any[]) {
      logger.error(util.format(...args));
      originalConsoleError.apply(console, args);
    };

    console.warn = function (...args: any[]) {
      logger.warn(util.format(...args));
      originalConsoleWarn.apply(console, args);
    };

    console.info = function (...args: any[]) {
      logger.info(util.format(...args));
      originalConsoleInfo.apply(console, args);
    };

    // 2. Patch HTTP for Access Logging
    const originalEnd = http.ServerResponse.prototype.end;
    // @ts-ignore
    http.ServerResponse.prototype.end = function (this: any, ...args: any[]) {
      const res = this;
      const req = res.req;
      if (req && !req.url.startsWith('/_next/') && !req.url.startsWith('/favicon.ico') && !req.url.includes('_rsc=')) {
        const start = req._startTime || Date.now();
        const duration = Date.now() - start;
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        if (Array.isArray(ip)) ip = ip[0];
        if (ip.startsWith('::ffff:')) ip = ip.substring(7);

        const method = req.method;
        const url = req.url;
        const status = res.statusCode;

        // <source ip-adress> - [GET] - <timestamp> - [info] : <url> - <status> (<duration>ms)
        accessLogger.info(`${ip} - [${method}] - <timestamp> - [<level>] : ${url} - ${status} (${duration}ms)`);
      }
      return originalEnd.apply(this, args as any);
    };

    const originalEmit = http.Server.prototype.emit;
    // @ts-ignore
    http.Server.prototype.emit = function (this: any, event: string, ...args: any[]) {
      if (event === 'request') {
        const req = args[0];
        if (req) {
          req._startTime = Date.now();
        }
      }
      return originalEmit.apply(this, [event, ...args] as any);
    };

    logger.info('Logger interceptor and HTTP patch registered in instrumentation.ts');

    // Ensure database tables exist
    try {
      const { ensureUsersTable } = await import('./db');
      await ensureUsersTable();
      logger.info('Database tables verified/created');
    } catch (err) {
      logger.error('Failed to ensure database tables:', err);
    }
  }
}
