export type TestStatus = 'passed' | 'failed' | 'skipped';

export interface HttpRequest {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
}

export interface HttpResponse {
  status: number;
  statusText: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
}

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
  request?: HttpRequest;
  response?: HttpResponse;
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
