import { WriteStream, createWriteStream, mkdirSync } from 'fs';
import { join } from 'path';
import config from './config';
import { logger } from './logger';
import { TraceFrame } from './types';

const CSV_OUTPUT_DIR = join(process.cwd(), 'csv-data');
const MAX_ROWS_PER_FILE = 1_000_000;

type CsvFrameRecord = Record<string, unknown>;

function createSessionId(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

function sanitizeFilePart(value: string): string {
    return (
        value
            .trim()
            .replace(/[<>:"/\\|?*\s]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .toLowerCase() || 'unknown'
    );
}

function getColumnsFromFrame(frame: CsvFrameRecord): string[] {
    const keys = Object.keys(frame);

    if (keys.length === 0) {
        throw new Error('Cannot derive CSV header from an empty frame');
    }

    // 从真实帧动态提取变量名，同时尽量把 ts 放到第一列
    if (!keys.includes('ts')) {
        return keys;
    }

    return ['ts', ...keys.filter((key) => key !== 'ts')];
}

function escapeCsvValue(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    const text = String(value);
    if (!/[",\r\n]/.test(text)) {
        return text;
    }

    return `"${text.replace(/"/g, '""')}"`;
}

function frameToCsvLine(frame: CsvFrameRecord, columns: readonly string[]): string {
    return columns.map((column) => escapeCsvValue(frame[column])).join(',');
}

function sameColumns(left: readonly string[], right: readonly string[]): boolean {
    if (left.length !== right.length) return false;

    for (let i = 0; i < left.length; i++) {
        if (left[i] !== right[i]) {
            return false;
        }
    }

    return true;
}

class CsvFrameWriter {
    private currentStream: WriteStream | null = null;
    private currentFilePath = '';
    private currentColumns: string[] = [];
    private rowsInCurrentFile = 0;
    private fileIndex = 0;
    private readonly sessionId = createSessionId();
    private readonly filePrefix = [
        sanitizeFilePart(config.TOPIC),
        sanitizeFilePart(config.GROUP_ID),
        this.sessionId,
    ].join('__');
    private writeQueue: Promise<void> = Promise.resolve();

    constructor() {
        mkdirSync(CSV_OUTPUT_DIR, { recursive: true });
    }

    appendFrames(frames: TraceFrame[]): Promise<void> {
        if (frames.length === 0) return this.writeQueue;

        this.writeQueue = this.writeQueue.then(async () => {
            const rawFrames = frames as unknown as CsvFrameRecord[];
            const columns = getColumnsFromFrame(rawFrames[0]);
            let cursor = 0;

            while (cursor < rawFrames.length) {
                await this.ensureWritableStream(columns);

                const writableRows = MAX_ROWS_PER_FILE - this.rowsInCurrentFile;
                const chunk = rawFrames.slice(cursor, cursor + writableRows);
                const block = chunk.map((frame) => frameToCsvLine(frame, columns)).join('\n') + '\n';

                await this.writeBlock(block);

                this.rowsInCurrentFile += chunk.length;
                cursor += chunk.length;
            }
        });

        return this.writeQueue;
    }

    close(): Promise<void> {
        this.writeQueue = this.writeQueue.then(() => this.closeCurrentStream());
        return this.writeQueue;
    }

    private async ensureWritableStream(columns: readonly string[]): Promise<void> {
        if (
            this.currentStream &&
            this.rowsInCurrentFile < MAX_ROWS_PER_FILE &&
            sameColumns(this.currentColumns, columns)
        ) {
            return;
        }

        if (this.currentStream) {
            await this.closeCurrentStream();
        }

        this.fileIndex++;
        this.rowsInCurrentFile = 0;
        this.currentFilePath = join(
            CSV_OUTPUT_DIR,
            `${this.filePrefix}__part-${String(this.fileIndex).padStart(4, '0')}.csv`,
        );
        this.currentColumns = [...columns];
        this.currentStream = createWriteStream(this.currentFilePath, {
            flags: 'w',
            encoding: 'utf8',
        });

        await this.writeBlock(this.currentColumns.join(',') + '\n');
        logger.info(`CSV file opened: ${this.currentFilePath}`);
    }

    private writeBlock(block: string): Promise<void> {
        const stream = this.currentStream;

        if (!stream) {
            return Promise.reject(new Error('CSV stream is not initialized'));
        }

        return new Promise<void>((resolve, reject) => {
            const handleError = (error: Error): void => {
                stream.off('error', handleError);
                reject(error);
            };

            stream.once('error', handleError);
            stream.write(block, 'utf8', () => {
                stream.off('error', handleError);
                resolve();
            });
        });
    }

    private closeCurrentStream(): Promise<void> {
        if (!this.currentStream) {
            return Promise.resolve();
        }

        const stream = this.currentStream;
        const filePath = this.currentFilePath;

        this.currentStream = null;
        this.currentFilePath = '';
        this.currentColumns = [];

        return new Promise<void>((resolve, reject) => {
            const handleError = (error: Error): void => {
                stream.off('error', handleError);
                reject(error);
            };

            stream.once('error', handleError);
            stream.end(() => {
                stream.off('error', handleError);
                logger.info(`CSV file closed: ${filePath}`);
                resolve();
            });
        });
    }
}

const csvFrameWriter = new CsvFrameWriter();

export function appendFramesToCsv(frames: TraceFrame[]): Promise<void> {
    return csvFrameWriter.appendFrames(frames);
}

export function closeCsvWriter(): Promise<void> {
    return csvFrameWriter.close();
}

export function getCsvOutputDir(): string {
    return CSV_OUTPUT_DIR;
}
