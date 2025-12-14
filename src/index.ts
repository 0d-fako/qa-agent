#!/usr/bin/env node
import { Command } from 'commander';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { RequirementParser } from './parser';
import { TestGenerator } from './generator';
import { TestExecutor } from './executor';

dotenv.config();

const program = new Command();

program
    .name('qa-agent')
    .description('AI-powered QA Test Agent using Cypress')
    .version('0.1.0');

program
    .command('generate')
    .description('Generate Cypress tests from requirements')
    .argument('<requirements>', 'Path to requirements file (Markdown)')
    .option('-o, --output <dir>', 'Output directory for tests', './cypress/e2e/generated')
    .action(async (reqPath, options) => {
        try {
            console.log(`Reading requirements from ${reqPath}...`);
            const parser = new RequirementParser();
            const requirements = parser.parse(reqPath);
            console.log(`Found ${requirements.length} requirements.`);

            console.log('Generating test cases...');
            const generator = new TestGenerator();
            const testCases = await generator.generateTestCases(requirements);
            console.log(`Generated ${testCases.length} test cases.`);

            console.log(`Writing specs to ${options.output}...`);
            const executor = new TestExecutor(options.output);
            await executor.generateSpecs(testCases);

            console.log('Done! Run `npx cypress open` or `npx cypress run` to execute tests.');
        } catch (error) {
            console.error('Error:', error);
            process.exit(1);
        }
    });

program
    .command('run')
    .description('Run generated tests (wrapper for cypress run)')
    .action(async () => {
        console.log('Running Cypress tests...');
        const executor = new TestExecutor('./cypress/e2e/generated');
        await executor.runTests();
    });

program.parse();
