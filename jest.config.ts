import { pathsToModuleNameMapper } from 'ts-jest';
import type { Config } from 'jest';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tsconfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'tsconfig.json'), 'utf8'));

const config: Config = {
  verbose: true,

  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },

  moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths || {}, {
    prefix: '<rootDir>/src/',
  }),

  testEnvironment: 'jsdom',

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  roots: ['<rootDir>/src'],

  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
};

export default config;
