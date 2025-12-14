import * as fs from 'fs';
import * as path from 'path';
import { TestCase, TestStep } from '../types';

export class TestExecutor {
    private outputDir: string;

    constructor(outputDir: string) {
        this.outputDir = outputDir;
    }

    public async generateSpecs(testCases: TestCase[]): Promise<void> {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        // Group by Requirement to create one spec file per requirement?
        // Or one giant spec? One per requirement is cleaner.

        const casesByReq = testCases.reduce((acc, tc) => {
            if (!acc[tc.requirementId]) acc[tc.requirementId] = [];
            acc[tc.requirementId].push(tc);
            return acc;
        }, {} as Record<string, TestCase[]>);

        for (const [reqId, cases] of Object.entries(casesByReq)) {
            const specContent = this.createSpecFileContent(reqId, cases);
            const filePath = path.join(this.outputDir, `${reqId}.cy.ts`);
            fs.writeFileSync(filePath, specContent);
            console.log(`Generated spec: ${filePath}`);
        }
    }

    private createSpecFileContent(reqId: string, cases: TestCase[]): string {
        return `
describe('Requirement: ${reqId}', () => {
  beforeEach(() => {
    // Default setup
  });

${cases.map(tc => this.formatTestCase(tc)).join('\n')}
});
    `.trim();
    }

    private formatTestCase(tc: TestCase): string {
        return `
  it('${tc.title.replace(/'/g, "\\'")}', () => {
    // ${tc.description}
    ${tc.steps.map(step => this.formatStep(step)).join('\n    ')}
  });
    `;
    }

    private formatStep(step: TestStep): string {
        // This translates generic steps to Cypress commands
        // In a real AI agent, the "Action" and "Selector" would be much more specific

        switch (step.action) {
            case 'navigate':
                return `cy.visit('${step.value}');`;
            case 'click':
                return `cy.get('${step.selector}').click();`;
            case 'input':
                return `cy.get('${step.selector}').type('${step.value}');`;
            case 'verify':
                return `// Validation step: ${step.description}`;
            case 'wait':
                return `cy.wait(${step.value});`;
            default:
                return `// TODO: Implement action '${step.action}': ${step.description}`;
        }
    }

    public async runTests(): Promise<void> {
        console.log('Use "npx cypress run" to execute the generated tests.');
        // implementation of programmatically running cypress could go here using 'cypress' module
    }
}
