"use client";

import { useState } from "react";
import { mockTestResults, getTestSummary, getTestsByStatus } from "@/lib/test-data";
import { TestCase, TestStatus } from "@/types/test-results";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  FileText,
  BarChart3,
} from "lucide-react";

export default function TestResultPage() {
  const testResults = mockTestResults;
  const summary = getTestSummary(testResults);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const passedTests = getTestsByStatus(testResults, "passed");
  const failedTests = getTestsByStatus(testResults, "failed");
  const skippedTests = getTestsByStatus(testResults, "skipped");

  const getStatusIcon = (status?: TestStatus) => {
    switch (status) {
      case "passed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "skipped":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status?: TestStatus) => {
    switch (status) {
      case "passed":
        return <Badge className="bg-green-500 hover:bg-green-600">通过</Badge>;
      case "failed":
        return <Badge variant="destructive">失败</Badge>;
      case "skipped":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">跳过</Badge>;
      default:
        return <Badge variant="secondary">未执行</Badge>;
    }
  };

  const filteredSuites = selectedCategory === "all" 
    ? testResults.suites 
    : testResults.suites.filter(suite => suite.category === selectedCategory);

  const categories = Array.from(new Set(testResults.suites.map(s => s.category)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            测试结果报告
          </h1>
          <p className="text-lg text-muted-foreground">
            IntelliTeach 智能教学辅助系统 - 综合测试报告
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>执行时间: {new Date(testResults.timestamp).toLocaleString("zh-CN")}</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                总测试数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {testResults.totalTests}
              </div>
              <p className="text-xs text-muted-foreground mt-1">覆盖 {testResults.suites.length} 个测试套件</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                通过测试
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {testResults.passedTests}
              </div>
              <p className="text-xs text-muted-foreground mt-1">成功率 {summary.successRate}%</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-white dark:from-red-950 dark:to-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                失败测试
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {testResults.failedTests}
              </div>
              <p className="text-xs text-muted-foreground mt-1">需要修复</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-slate-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                执行时长
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {(testResults.totalDuration / 1000).toFixed(1)}s
              </div>
              <p className="text-xs text-muted-foreground mt-1">平均 {summary.avgExecutionTime}ms/测试</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              测试分类
            </CardTitle>
            <CardDescription>按类别筛选测试结果</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === "all" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory("all")}
              >
                全部 ({testResults.totalTests})
              </Badge>
              {categories.map((category) => {
                const count = testResults.suites
                  .filter(s => s.category === category)
                  .reduce((sum, s) => sum + s.tests.length, 0);
                return (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category} ({count})
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Test Results Detail */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="all">全部测试</TabsTrigger>
            <TabsTrigger value="passed" className="text-green-600">通过 ({passedTests.length})</TabsTrigger>
            <TabsTrigger value="failed" className="text-red-600">失败 ({failedTests.length})</TabsTrigger>
            <TabsTrigger value="skipped" className="text-yellow-600">跳过 ({skippedTests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6 mt-6">
            {filteredSuites.map((suite) => (
              <Card key={suite.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                  <CardTitle className="flex items-center justify-between">
                    <span>{suite.name}</span>
                    <Badge variant="secondary">{suite.tests.length} 个测试</Badge>
                  </CardTitle>
                  <CardDescription>{suite.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {suite.tests.map((test) => (
                      <TestCaseDetail key={test.id} test={test} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="passed" className="space-y-4 mt-6">
            {passedTests.map((test) => (
              <TestCaseDetail key={test.id} test={test} />
            ))}
          </TabsContent>

          <TabsContent value="failed" className="space-y-4 mt-6">
            {failedTests.map((test) => (
              <TestCaseDetail key={test.id} test={test} />
            ))}
          </TabsContent>

          <TabsContent value="skipped" className="space-y-4 mt-6">
            {skippedTests.map((test) => (
              <TestCaseDetail key={test.id} test={test} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TestCaseDetail({ test }: { test: TestCase }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          {test.status === "passed" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          {test.status === "failed" && <XCircle className="h-5 w-5 text-red-500" />}
          {test.status === "skipped" && <AlertCircle className="h-5 w-5 text-yellow-500" />}
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-1">{test.name}</h4>
              <p className="text-sm text-muted-foreground">{test.description}</p>
            </div>
            <div className="flex items-center gap-3">
              {test.executionTime !== undefined && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {test.executionTime}ms
                </span>
              )}
              {test.status === "passed" && <Badge className="bg-green-500 hover:bg-green-600">通过</Badge>}
              {test.status === "failed" && <Badge variant="destructive">失败</Badge>}
              {test.status === "skipped" && <Badge variant="outline" className="border-yellow-500 text-yellow-500">跳过</Badge>}
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            {expanded ? "收起详情 ↑" : "查看详情 ↓"}
          </button>

          {expanded && (
            <div className="space-y-4 pt-4 border-t">
              <div>
                <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  测试输入
                </h5>
                <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4 text-sm whitespace-pre-line">
                  {test.input}
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  预期结果
                </h5>
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4 text-sm whitespace-pre-line">
                  {test.expectedOutput}
                </div>
              </div>

              {test.actualOutput && (
                <div>
                  <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${test.status === "passed" ? "bg-green-500" : "bg-red-500"}`}></span>
                    实际结果
                  </h5>
                  <div className={`${test.status === "passed" ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900" : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"} border rounded-lg p-4 text-sm whitespace-pre-line`}>
                    {test.actualOutput}
                  </div>
                </div>
              )}

              {test.error && (
                <div>
                  <h5 className="font-semibold text-sm mb-2 flex items-center gap-2 text-red-600">
                    <XCircle className="h-4 w-4" />
                    错误信息
                  </h5>
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4 text-sm text-red-700 dark:text-red-400">
                    {test.error}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
