export interface AcceptanceCriterion {
    id: string;
    description: string;
}

export interface Requirement {
    id: string;
    title: string;
    userStory: string;
    acceptanceCriteria: AcceptanceCriterion[];
    sourceFile?: string;
}

export interface TestStep {
    stepNumber: number;
    action: 'navigate' | 'click' | 'input' | 'wait' | 'verify' | 'unknown';
    selector?: string;
    value?: string;
    description: string;
    expectedResult?: string;
}

export interface TestCase {
    id: string;
    requirementId: string;
    title: string;
    description: string;
    steps: TestStep[];
    tags: string[];
}

export interface TestResult {
    testCaseId: string;
    status: 'passed' | 'failed' | 'skipped';
    error?: string;
    screenshotPath?: string;
    durationMs: number;
}
