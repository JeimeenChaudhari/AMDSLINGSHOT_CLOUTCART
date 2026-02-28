/**
 * Performance Benchmark Utility
 * Measures throughput, latency, and resource usage
 */

class PerformanceBenchmark {
  constructor() {
    this.results = [];
  }
  
  async measureThroughput(fn, iterations = 1) {
    const startTime = Date.now();
    const startMemory = this.getMemoryUsage();
    
    const result = await fn();
    
    const endTime = Date.now();
    const endMemory = this.getMemoryUsage();
    
    const duration = endTime - startTime;
    const throughput = iterations / (duration / 1000);
    const memoryIncrease = endMemory - startMemory;
    
    return {
      duration,
      throughput,
      memoryIncrease,
      result
    };
  }
  
  async measureLatency(fn, samples = 100) {
    const latencies = [];
    
    for (let i = 0; i < samples; i++) {
      const start = performance.now();
      await fn();
      const latency = performance.now() - start;
      latencies.push(latency);
    }
    
    latencies.sort((a, b) => a - b);
    
    return {
      min: latencies[0],
      max: latencies[latencies.length - 1],
      mean: latencies.reduce((a, b) => a + b) / latencies.length,
      median: latencies[Math.floor(latencies.length / 2)],
      p95: latencies[Math.floor(latencies.length * 0.95)],
      p99: latencies[Math.floor(latencies.length * 0.99)],
      samples: latencies
    };
  }
  
  async measureConcurrency(fn, concurrency = 10) {
    const promises = [];
    const startTime = Date.now();
    
    for (let i = 0; i < concurrency; i++) {
      promises.push(fn());
    }
    
    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;
    
    return {
      concurrency,
      duration,
      throughput: concurrency / (duration / 1000),
      results
    };
  }
  
  getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    if (typeof performance !== 'undefined' && performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }
  
  recordResult(name, metrics) {
    this.results.push({
      name,
      timestamp: Date.now(),
      ...metrics
    });
  }
  
  getResults() {
    return this.results;
  }
  
  generateReport() {
    const report = {
      totalTests: this.results.length,
      summary: {},
      details: this.results
    };
    
    // Calculate summary statistics
    const latencies = this.results.filter(r => r.mean).map(r => r.mean);
    if (latencies.length > 0) {
      report.summary.avgLatency = latencies.reduce((a, b) => a + b) / latencies.length;
      report.summary.maxLatency = Math.max(...latencies);
      report.summary.minLatency = Math.min(...latencies);
    }
    
    const throughputs = this.results.filter(r => r.throughput).map(r => r.throughput);
    if (throughputs.length > 0) {
      report.summary.avgThroughput = throughputs.reduce((a, b) => a + b) / throughputs.length;
    }
    
    return report;
  }
}

module.exports = PerformanceBenchmark;
