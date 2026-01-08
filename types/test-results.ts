export type TestStatus = 'passed' | 'failed' | 'skipped';

export interface TestCase {
  id: string;
  name: string;
  description: string;
  category: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  status?: TestStatus;
  executionTime?: number;
  screenshot?: string;
  error?: string;
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  category: string;
  tests: TestCase[];
}

export interface TestResult {
  id: string;
  timestamp: Date;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  totalDuration: number;
  suites: TestSuite[];
}
