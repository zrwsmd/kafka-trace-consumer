/**
 * 日志模块
 * 同时输出到控制台 + 写入日志文件 logs/consumer-YYYY-MM-DD.log
 */
import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const LOG_DIR = join(process.cwd(), 'logs');

// 确保 logs 目录存在
mkdirSync(LOG_DIR, { recursive: true });

function getLogFile(): string {
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return join(LOG_DIR, `consumer-${date}.log`);
}

function formatLine(level: string, msg: string): string {
    const time = new Date().toLocaleString('zh-CN', { hour12: false });
    return `[${time}] [${level}] ${msg}`;
}

function writeToFile(line: string): void {
    try {
        appendFileSync(getLogFile(), line + '\n', 'utf8');
    } catch {
        // 写文件失败不影响主流程
    }
}

export const logger = {
    info(msg: string): void {
        const line = formatLine('INFO ', msg);
        console.log(line);
        writeToFile(line);
    },
    warn(msg: string): void {
        const line = formatLine('WARN ', msg);
        console.warn(line);
        writeToFile(line);
    },
    error(msg: string): void {
        const line = formatLine('ERROR', msg);
        console.error(line);
        writeToFile(line);
    },
    progress(msg: string): void {
        const line = formatLine('STATS', msg);
        console.log(line);
        writeToFile(line);
    },
};
