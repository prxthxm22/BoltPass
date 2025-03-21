import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  testStoragePerformance,
  testBatchOperations,
  runStressTest,
  getSystemInfo,
  getMemoryUsage
} from '@/utils/performanceTest';
import { AlertCircle, BarChart3, Timer, Server, HardDrive, Cpu, RefreshCw, Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PerformanceResult {
  type: string;
  time: number;
  count: number;
  success: number;
  memory?: number;
}

export default function DiagnosticsPage() {
  const [results, setResults] = useState<PerformanceResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testSize, setTestSize] = useState(100);
  const [stressLevel, setStressLevel] = useState(5);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [activeTab, setActiveTab] = useState<'system' | 'storage' | 'stress'>('system');

  const handleQuickTest = async () => {
    try {
      setIsRunning(true);
      setResults([]);
      
      // Basic storage test
      const storageResult = await testStoragePerformance(testSize);
      setResults(prev => [...prev, {
        type: 'Storage Test',
        time: storageResult.totalTimeMs,
        count: testSize,
        success: storageResult.successRate,
        memory: storageResult.memoryUsageMB
      }]);
      
      // Batch operations test
      const batchSize = 20;
      const batchCount = 5;
      const batchResult = await testBatchOperations(batchSize, batchCount);
      setResults(prev => [...prev, {
        type: 'Batch Operations',
        time: batchResult.totalTimeMs,
        count: batchSize * batchCount,
        success: batchResult.successRate,
        memory: batchResult.memoryUsageMB
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleStressTest = async () => {
    try {
      setIsRunning(true);
      setResults([]);
      
      const maxCredentials = testSize * 10;
      const steps = stressLevel;
      
      // Update progress as test runs
      let currentStep = 0;
      
      const updateProgress = () => {
        currentStep++;
        setProgressValue(Math.round((currentStep / steps) * 100));
      };
      
      // Run stress test
      const stressResults = await runStressTest(maxCredentials, steps);
      
      // Convert results to our format
      const formattedResults = stressResults.map((result, index) => {
        updateProgress();
        return {
          type: `Stress Test (${result.operationCount} credentials)`,
          time: result.totalTimeMs,
          count: result.operationCount,
          success: result.successRate,
          memory: result.memoryUsageMB
        };
      });
      
      setResults(formattedResults);
    } finally {
      setIsRunning(false);
      setProgressValue(100);
      // Reset progress after a delay
      setTimeout(() => setProgressValue(0), 1000);
    }
  };

  const fetchSystemInfo = () => {
    setSystemInfo(getSystemInfo());
  };

  const downloadResults = () => {
    try {
      const data = {
        results,
        systemInfo: systemInfo || getSystemInfo(),
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `boltpass-diagnostics-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading results:', error);
    }
  };

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">System Diagnostics</h1>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <Button
            variant={activeTab === 'system' ? 'default' : 'outline'}
            onClick={() => setActiveTab('system')}
            className="gap-2"
          >
            <Server size={16} />
            System Info
          </Button>
          <Button
            variant={activeTab === 'storage' ? 'default' : 'outline'}
            onClick={() => setActiveTab('storage')}
            className="gap-2"
          >
            <HardDrive size={16} />
            Storage Tests
          </Button>
          <Button
            variant={activeTab === 'stress' ? 'default' : 'outline'}
            onClick={() => setActiveTab('stress')}
            className="gap-2"
          >
            <Cpu size={16} />
            Stress Tests
          </Button>
        </div>
        
        {activeTab === 'system' && (
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">System Information</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSystemInfo}
                disabled={isRunning}
              >
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </Button>
            </div>
            
            {systemInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Browser</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">User Agent:</span>
                      <span className="font-mono max-w-xs truncate">{systemInfo.userAgent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform:</span>
                      <span>{systemInfo.platform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Language:</span>
                      <span>{systemInfo.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Online:</span>
                      <span>{systemInfo.onLine ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Resources</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Screen Resolution:</span>
                      <span>{systemInfo.screenWidth} x {systemInfo.screenHeight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pixel Ratio:</span>
                      <span>{systemInfo.devicePixelRatio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Memory Usage:</span>
                      <span>
                        {systemInfo.memoryAvailable ? `${systemInfo.memoryAvailable} MB` : 'Not available'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Storage:</span>
                      <span>
                        {systemInfo.storageAvailable.available
                          ? `Available (${systemInfo.storageAvailable.estimatedSpace || 'Unknown'})`
                          : 'Not available'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Click "Refresh" to gather system information</p>
              </div>
            )}
          </Card>
        )}
        
        {activeTab === 'storage' && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Storage Performance</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="test-size">Test Size (Credentials)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    id="test-size"
                    min={10}
                    max={1000}
                    step={10}
                    value={[testSize]}
                    onValueChange={(values) => setTestSize(values[0])}
                    disabled={isRunning}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={10}
                    max={1000}
                    value={testSize}
                    onChange={(e) => setTestSize(parseInt(e.target.value) || 100)}
                    disabled={isRunning}
                    className="w-20"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleQuickTest}
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? 'Running Test...' : 'Run Quick Storage Test'}
              </Button>
              
              {isRunning && (
                <Progress value={75} className="animate-pulse" />
              )}
            </div>
            
            {results.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Results</h3>
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium">{result.type}</h4>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Timer size={14} />
                          {result.time.toFixed(2)} ms
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Items:</span> {result.count}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Success:</span> {result.success.toFixed(1)}%
                        </div>
                        {result.memory && (
                          <div>
                            <span className="text-muted-foreground">Memory:</span> {result.memory} MB
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  onClick={downloadResults}
                  className="mt-4 w-full gap-2"
                >
                  <Download size={16} />
                  Download Results
                </Button>
              </div>
            )}
          </Card>
        )}
        
        {activeTab === 'stress' && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Stress Testing</h2>
            
            <Alert variant="warning" className="mb-4 bg-yellow-950/50 border-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Stress tests may impact browser performance. Ensure you save any work before running tests.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="test-size-stress">Base Size (Credentials)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    id="test-size-stress"
                    min={10}
                    max={500}
                    step={10}
                    value={[testSize]}
                    onValueChange={(values) => setTestSize(values[0])}
                    disabled={isRunning}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={10}
                    max={500}
                    value={testSize}
                    onChange={(e) => setTestSize(parseInt(e.target.value) || 100)}
                    disabled={isRunning}
                    className="w-20"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  The maximum test will use 10x this value
                </p>
              </div>
              
              <div>
                <Label htmlFor="stress-level">Stress Level (Steps)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    id="stress-level"
                    min={2}
                    max={10}
                    step={1}
                    value={[stressLevel]}
                    onValueChange={(values) => setStressLevel(values[0])}
                    disabled={isRunning}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={2}
                    max={10}
                    value={stressLevel}
                    onChange={(e) => setStressLevel(parseInt(e.target.value) || 5)}
                    disabled={isRunning}
                    className="w-20"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  More steps provide better insight but take longer
                </p>
              </div>
              
              <Button
                onClick={handleStressTest}
                disabled={isRunning}
                className="w-full"
                variant="destructive"
              >
                {isRunning ? 'Running Stress Test...' : 'Run Stress Test'}
              </Button>
              
              {isRunning && progressValue > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>{progressValue}%</span>
                  </div>
                  <Progress value={progressValue} />
                </div>
              )}
            </div>
            
            {results.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium">Stress Test Results</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadResults}
                    className="gap-1"
                  >
                    <Download size={14} />
                    Export
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium">{result.type}</h4>
                        <span className="text-sm text-muted-foreground">
                          {result.time.toFixed(1)} ms
                        </span>
                      </div>
                      
                      <div className="mt-2">
                        <div className="text-xs mb-1 flex justify-between">
                          <span>Performance</span>
                          <span>{(result.count / (result.time / 1000)).toFixed(1)} ops/sec</span>
                        </div>
                        <Progress 
                          value={100 - Math.min(100, (result.time / (result.count * 2)))} 
                          className={`h-2 ${
                            result.time / result.count < 1 
                              ? 'bg-green-500' 
                              : result.time / result.count < 5 
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                          }`} 
                        />
                      </div>
                      
                      <div className="mt-2">
                        <div className="text-xs mb-1 flex justify-between">
                          <span>Success Rate</span>
                          <span>{result.success.toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={result.success} 
                          className={`h-2 ${
                            result.success > 95 
                              ? 'bg-green-500' 
                              : result.success > 80 
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                          }`} 
                        />
                      </div>
                      
                      {result.memory && (
                        <div className="mt-2">
                          <div className="text-xs mb-1 flex justify-between">
                            <span>Memory Usage</span>
                            <span>{result.memory} MB</span>
                          </div>
                          <Progress 
                            value={Math.min(100, (result.memory / 100) * 100)} 
                            className={`h-2 ${
                              result.memory < 50 
                                ? 'bg-green-500' 
                                : result.memory < 150 
                                  ? 'bg-yellow-500' 
                                  : 'bg-red-500'
                            }`} 
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </Layout>
  );
} 