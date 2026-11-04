import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

const envFile = new URL('../.env', import.meta.url);
if (existsSync(envFile)) loadEnvFile(envFile);

function positiveInteger(value, fallback, name, max = Number.MAX_SAFE_INTEGER) {
  const text = value ?? String(fallback);
  const number = Number(text);
  if (!/^\d+$/.test(text) || !Number.isSafeInteger(number) || number < 1 || number > max) {
    throw new Error(`${name} 必须为 1～${max} 的整数。`);
  }
  return number;
}

export const config = Object.freeze({
  host: '127.0.0.1',
  port: positiveInteger(process.env.PORT, 3001, 'PORT', 65535),
});
