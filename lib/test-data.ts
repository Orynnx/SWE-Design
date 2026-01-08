import { TestResult, TestSuite, TestCase } from '@/types/test-results';

/**
 * Mock test results based on TESTING.md requirements
 * These represent comprehensive test coverage for the IntelliTeach system
 */
// Use a fixed timestamp to avoid hydration mismatch
const TEST_RUN_TIMESTAMP = new Date('2026-01-08T08:40:35Z');

export const mockTestResults: TestResult = {
  id: 'test-run-20260108084035',
  timestamp: TEST_RUN_TIMESTAMP,
  totalTests: 24,
  passedTests: 22,
  failedTests: 1,
  skippedTests: 1,
  totalDuration: 3456,
  suites: [
    {
      id: 'suite-1',
      name: '边界测试',
      description: '验证系统在边界条件下的行为',
      category: 'boundary',
      tests: [
        {
          id: 'test-1-1',
          name: 'AI Token 耗尽测试',
          description: '验证订阅守卫机制正常工作',
          category: 'boundary',
          input: `
1. 创建测试组织，设置 aiTokenLimit = 100
2. 手动将 aiTokenUsage 设置为 100
3. 教师尝试使用 AI 批改作业`,
          expectedOutput: `
❌ 错误提示: "AI 服务额度已耗尽或订阅过期，请联系管理员"
✅ 系统不调用 智谱AI GLM API
✅ 数据库 Token 使用量不变`,
          actualOutput: '系统正确拦截请求，返回错误提示："AI 服务额度已耗尽或订阅过期，请联系管理员"',
          status: 'passed',
          executionTime: 156,
          request: {
            method: 'POST',
            url: '/api/submissions/sub-67890/grade',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            body: {
              submissionId: 'sub-67890',
              useAI: true,
            },
          },
          response: {
            status: 403,
            statusText: 'Forbidden',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              success: false,
              error: 'AI 服务额度已耗尽或订阅过期，请联系管理员',
              code: 'AI_TOKEN_EXHAUSTED',
            },
          },
        },
        {
          id: 'test-1-2',
          name: '非法文件格式测试',
          description: '验证 CSV 导入的文件格式校验',
          category: 'boundary',
          input: `
1. 管理员进入用户批量导入页面
2. 上传一个 .txt 文件
3. 点击导入`,
          expectedOutput: `
❌ Zod 验证错误: "文件格式必须为 CSV"
✅ 不执行数据库写入
✅ 显示友好的错误提示`,
          actualOutput: 'Zod 验证正确拦截，显示错误："文件格式必须为 CSV"',
          status: 'passed',
          executionTime: 89,
          request: {
            method: 'POST',
            url: '/api/admin/users/import',
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            body: {
              file: {
                name: 'users.txt',
                type: 'text/plain',
                size: 1024,
              },
            },
          },
          response: {
            status: 400,
            statusText: 'Bad Request',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              success: false,
              error: '文件格式必须为 CSV',
              code: 'INVALID_FILE_FORMAT',
              details: {
                field: 'file',
                expected: 'text/csv',
                received: 'text/plain',
              },
            },
          },
        },
        {
          id: 'test-1-3',
          name: '封禁用户登录测试',
          description: '验证封禁机制和中间件拦截',
          category: 'boundary',
          input: `
1. 管理员封禁一个用户 (设置 status = 'BANNED')
2. 该用户尝试登录
3. 已登录用户被封禁后刷新页面`,
          expectedOutput: `
❌ 登录失败: "账号已被封禁"
✅ 已登录用户被强制登出
✅ 重定向至 /unauthorized 页面`,
          actualOutput: '用户无法登录，显示："账号已被封禁"，已登录用户被重定向至 /unauthorized',
          status: 'passed',
          executionTime: 234,
          request: {
            method: 'POST',
            url: '/api/auth/callback/credentials',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              email: 'banned_user@example.com',
              password: 'password123',
              csrfToken: 'csrf-token-here',
            },
          },
          response: {
            status: 401,
            statusText: 'Unauthorized',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              success: false,
              error: '账号已被封禁',
              code: 'USER_BANNED',
              redirectTo: '/unauthorized',
            },
          },
        },
      ],
    },
    {
      id: 'suite-2',
      name: '用户认证测试',
      description: '验证用户登录和认证功能',
      category: 'authentication',
      tests: [
        {
          id: 'test-2-1',
          name: '正常登录',
          description: '使用正确的邮箱和密码登录',
          category: 'authentication',
          input: '邮箱: test@example.com, 密码: correct_password',
          expectedOutput: '登录成功，跳转到对应角色的 Dashboard',
          actualOutput: '登录成功，跳转至 /teacher/dashboard',
          status: 'passed',
          executionTime: 345,
          request: {
            method: 'POST',
            url: '/api/auth/callback/credentials',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              email: 'test@example.com',
              password: 'correct_password',
              csrfToken: 'csrf-token-here',
            },
          },
          response: {
            status: 200,
            statusText: 'OK',
            headers: {
              'Content-Type': 'application/json',
              'Set-Cookie': 'next-auth.session-token=...; Path=/; HttpOnly; Secure',
            },
            body: {
              success: true,
              user: {
                id: 'user-123',
                name: '张老师',
                email: 'test@example.com',
                role: 'TEACHER',
                organizationId: 'org-456',
              },
              redirectTo: '/teacher/dashboard',
            },
          },
        },
        {
          id: 'test-2-2',
          name: '错误密码',
          description: '使用错误的密码尝试登录',
          category: 'authentication',
          input: '邮箱: test@example.com, 密码: wrong_password',
          expectedOutput: '提示"登录失败：Invalid credentials"',
          actualOutput: '提示"登录失败：Invalid credentials"',
          status: 'passed',
          executionTime: 198,
          request: {
            method: 'POST',
            url: '/api/auth/callback/credentials',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              email: 'test@example.com',
              password: 'wrong_password',
              csrfToken: 'csrf-token-here',
            },
          },
          response: {
            status: 401,
            statusText: 'Unauthorized',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              success: false,
              error: 'Invalid credentials',
              code: 'INVALID_CREDENTIALS',
            },
          },
        },
        {
          id: 'test-2-3',
          name: '不存在的用户',
          description: '使用未注册的邮箱登录',
          category: 'authentication',
          input: '邮箱: nonexistent@example.com, 密码: any_password',
          expectedOutput: '提示"登录失败"',
          actualOutput: '提示"登录失败"',
          status: 'passed',
          executionTime: 167,
        },
        {
          id: 'test-2-4',
          name: '空字段',
          description: '邮箱或密码为空',
          category: 'authentication',
          input: '邮箱: "", 密码: ""',
          expectedOutput: '前端 Zod 验证阻止提交',
          actualOutput: '前端 Zod 验证阻止提交，显示必填字段错误',
          status: 'passed',
          executionTime: 45,
        },
      ],
    },
    {
      id: 'suite-3',
      name: '组织管理测试',
      description: '验证组织的创建、更新和权限控制',
      category: 'organization',
      tests: [
        {
          id: 'test-3-1',
          name: '创建组织',
          description: '使用有效的组织名称创建组织',
          category: 'organization',
          input: '组织名称: "江南大学", aiTokenLimit: 100000',
          expectedOutput: '组织创建成功',
          actualOutput: '组织创建成功，ID: org-12345',
          status: 'passed',
          executionTime: 234,
          request: {
            method: 'POST',
            url: '/api/admin/organizations',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            body: {
              name: '江南大学',
              domain: '@jiangnan.edu.cn',
              aiTokenLimit: 100000,
              aiSubStatus: 'ACTIVE',
            },
          },
          response: {
            status: 201,
            statusText: 'Created',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              success: true,
              data: {
                id: 'org-12345',
                name: '江南大学',
                domain: '@jiangnan.edu.cn',
                aiTokenLimit: 100000,
                aiTokenUsage: 0,
                aiSubStatus: 'ACTIVE',
                createdAt: '2026-01-08T08:40:30Z',
              },
            },
          },
        },
        {
          id: 'test-3-2',
          name: '重复组织名',
          description: '使用已存在的组织名称创建组织',
          category: 'organization',
          input: '组织名称: "江南大学"（已存在）',
          expectedOutput: 'Prisma unique constraint 错误',
          actualOutput: 'Prisma 错误：组织名称已存在',
          status: 'passed',
          executionTime: 123,
        },
        {
          id: 'test-3-3',
          name: '更新订阅',
          description: '更新组织的 Token 限制',
          category: 'organization',
          input: '新的 Token 限制: 200000',
          expectedOutput: '订阅更新成功',
          actualOutput: '订阅更新成功，新限制: 200000',
          status: 'passed',
          executionTime: 178,
        },
        {
          id: 'test-3-4',
          name: '非管理员访问',
          description: '教师或学生尝试访问组织管理页面',
          category: 'organization',
          input: '角色: TEACHER',
          expectedOutput: '重定向至 /unauthorized',
          actualOutput: '中间件拦截，重定向至 /unauthorized',
          status: 'passed',
          executionTime: 98,
        },
      ],
    },
    {
      id: 'suite-4',
      name: '课程管理测试',
      description: '验证课程的创建、选课和权限控制',
      category: 'course',
      tests: [
        {
          id: 'test-4-1',
          name: '教师创建课程',
          description: '教师创建新课程',
          category: 'course',
          input: '课程名称: "软件工程2024", 代码: "SE101"',
          expectedOutput: '课程创建成功',
          actualOutput: '课程创建成功，ID: course-12345',
          status: 'passed',
          executionTime: 267,
          request: {
            method: 'POST',
            url: '/api/teacher/courses',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            body: {
              name: '软件工程2024',
              code: 'SE101',
              description: '软件工程基础课程',
            },
          },
          response: {
            status: 201,
            statusText: 'Created',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              success: true,
              data: {
                id: 'course-12345',
                name: '软件工程2024',
                code: 'SE101',
                description: '软件工程基础课程',
                teacherId: 'user-123',
                organizationId: 'org-456',
                archived: false,
                createdAt: '2026-01-08T08:40:32Z',
              },
            },
          },
        },
        {
          id: 'test-4-2',
          name: '学生选课',
          description: '学生加入课程',
          category: 'course',
          input: '课程 ID: course-12345',
          expectedOutput: '选课成功，Enrollment 记录创建',
          actualOutput: '选课成功，Enrollment ID: enroll-12345',
          status: 'passed',
          executionTime: 189,
        },
        {
          id: 'test-4-3',
          name: '重复选课',
          description: '学生重复加入已选的课程',
          category: 'course',
          input: '课程 ID: course-12345（已选）',
          expectedOutput: 'unique constraint 阻止',
          actualOutput: 'Prisma 错误：已选过该课程',
          status: 'passed',
          executionTime: 134,
        },
        {
          id: 'test-4-4',
          name: '跨组织访问',
          description: '尝试访问其他组织的课程',
          category: 'course',
          input: '课程 ID: other-org-course',
          expectedOutput: '查询结果为空',
          actualOutput: '查询结果为空，数据隔离正常',
          status: 'passed',
          executionTime: 112,
        },
      ],
    },
    {
      id: 'suite-5',
      name: '作业提交与批改测试',
      description: '验证作业提交、AI 批改和手动批改功能',
      category: 'assignment',
      tests: [
        {
          id: 'test-5-1',
          name: '学生提交作业',
          description: '学生提交作业内容',
          category: 'assignment',
          input: '作业内容: "这是我的作业..."',
          expectedOutput: 'Submission 创建，status = SUBMITTED',
          actualOutput: 'Submission 创建成功，ID: sub-12345',
          status: 'passed',
          executionTime: 234,
          request: {
            method: 'POST',
            url: '/api/student/assignments/assign-789/submit',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            body: {
              assignmentId: 'assign-789',
              content: '这是我的作业内容...\n\n实现了所有要求的功能：\n1. 用户认证\n2. 数据库设计\n3. API接口实现',
              fileUrls: ['https://storage.example.com/files/homework-123.pdf'],
            },
          },
          response: {
            status: 201,
            statusText: 'Created',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              success: true,
              data: {
                id: 'sub-12345',
                assignmentId: 'assign-789',
                studentId: 'user-456',
                content: '这是我的作业内容...',
                fileUrls: ['https://storage.example.com/files/homework-123.pdf'],
                status: 'SUBMITTED',
                submittedAt: '2026-01-08T08:40:33Z',
              },
            },
          },
        },
        {
          id: 'test-5-2',
          name: 'AI 批改',
          description: '使用 AI 批改学生作业',
          category: 'assignment',
          input: '提交 ID: sub-12345',
          expectedOutput: '返回评分+反馈',
          actualOutput: '评分: 85, 反馈: "优点：逻辑清晰... 不足：缺少异常处理..."',
          status: 'passed',
          executionTime: 1245,
          request: {
            method: 'POST',
            url: '/api/teacher/submissions/sub-12345/grade',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            body: {
              submissionId: 'sub-12345',
              useAI: true,
            },
          },
          response: {
            status: 200,
            statusText: 'OK',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              success: true,
              data: {
                submissionId: 'sub-12345',
                score: 85,
                aiAnalysis: {
                  strengths: [
                    '代码逻辑清晰，结构合理',
                    '遵循了良好的命名规范',
                    '注释完整，易于理解',
                  ],
                  weaknesses: [
                    '缺少异常处理机制',
                    '部分函数可以进一步优化',
                  ],
                  suggestion: '建议增加错误处理和输入验证，提高代码健壮性',
                },
                status: 'GRADED',
                tokenUsed: 1250,
                gradedAt: '2026-01-08T08:40:34Z',
              },
            },
          },
        },
        {
          id: 'test-5-3',
          name: '截止时间后提交',
          description: '在截止时间后提交作业',
          category: 'assignment',
          input: '作业 ID: assignment-12345（已截止）',
          expectedOutput: '提示"作业已截止"',
          actualOutput: '提示"作业已截止"，提交被拒绝',
          status: 'failed',
          executionTime: 89,
          error: '实现中未完全阻止截止后提交，需要修复',
          request: {
            method: 'POST',
            url: '/api/student/assignments/assign-999/submit',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            body: {
              assignmentId: 'assign-999',
              content: '迟交的作业内容',
              fileUrls: [],
            },
          },
          response: {
            status: 400,
            statusText: 'Bad Request',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              success: false,
              error: '作业已截止',
              code: 'ASSIGNMENT_EXPIRED',
              details: {
                deadline: '2026-01-07T23:59:59Z',
                currentTime: '2026-01-08T08:40:35Z',
              },
            },
          },
        },
        {
          id: 'test-5-4',
          name: '教师手动批改',
          description: '教师手动批改作业',
          category: 'assignment',
          input: '分数: 90, 反馈: "很好的完成度"',
          expectedOutput: 'Submission 更新',
          actualOutput: 'Submission 更新成功',
          status: 'passed',
          executionTime: 156,
        },
      ],
    },
    {
      id: 'suite-6',
      name: '安全性测试',
      description: '验证系统的安全性',
      category: 'security',
      tests: [
        {
          id: 'test-6-1',
          name: 'SQL 注入测试',
          description: '尝试 SQL 注入攻击',
          category: 'security',
          input: 'email: "admin\' OR \'1\'=\'1", password: "anything"',
          expectedOutput: 'Prisma ORM 自动转义，无法注入',
          actualOutput: '登录失败，SQL 注入被 Prisma 阻止',
          status: 'passed',
          executionTime: 178,
          request: {
            method: 'POST',
            url: '/api/auth/callback/credentials',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              email: "admin' OR '1'='1",
              password: 'anything',
              csrfToken: 'csrf-token-here',
            },
          },
          response: {
            status: 401,
            statusText: 'Unauthorized',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              success: false,
              error: 'Invalid credentials',
              code: 'INVALID_CREDENTIALS',
              note: 'SQL injection attempt detected and blocked by Prisma ORM',
            },
          },
        },
        {
          id: 'test-6-2',
          name: 'XSS 测试',
          description: '尝试跨站脚本攻击',
          category: 'security',
          input: '课程名称: "<script>alert(\'XSS\')</script>"',
          expectedOutput: 'React 自动转义 HTML，显示为文本',
          actualOutput: 'HTML 被转义显示为文本，XSS 攻击失败',
          status: 'passed',
          executionTime: 145,
        },
        {
          id: 'test-6-3',
          name: 'CSRF 测试',
          description: '尝试跨站请求伪造',
          category: 'security',
          input: '从外部站点发起 POST 请求',
          expectedOutput: 'NextAuth CSRF Token 验证失败',
          actualOutput: 'CSRF Token 验证失败，请求被拒绝',
          status: 'passed',
          executionTime: 234,
        },
        {
          id: 'test-6-4',
          name: '密码加密测试',
          description: '验证密码是否正确加密存储',
          category: 'security',
          input: '密码: "testpassword123"',
          expectedOutput: 'bcrypt 加密存储，无法直接读取明文',
          actualOutput: '密码使用 bcrypt 加密，数据库中存储的是哈希值',
          status: 'skipped',
          executionTime: 0,
        },
      ],
    },
  ],
};

/**
 * Get test results summary
 */
export function getTestSummary(result: TestResult) {
  const successRate = (result.passedTests / result.totalTests * 100).toFixed(1);
  return {
    successRate,
    avgExecutionTime: (result.totalDuration / result.totalTests).toFixed(0),
  };
}

/**
 * Get tests by status
 */
export function getTestsByStatus(result: TestResult, status: 'passed' | 'failed' | 'skipped') {
  return result.suites.flatMap(suite => 
    suite.tests.filter(test => test.status === status)
  );
}

/**
 * Get tests by category
 */
export function getTestsByCategory(result: TestResult) {
  const categories = new Map<string, number>();
  result.suites.forEach(suite => {
    const count = categories.get(suite.category) || 0;
    categories.set(suite.category, count + suite.tests.length);
  });
  return categories;
}
