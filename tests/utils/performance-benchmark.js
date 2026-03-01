// Performance Benchmark Utility

class PerformanceBenchmark {
  constructor() {
    this.results = [];
  }

  async measureThroughput(operation) {
    const startTime = Date.now();
    const startMemory = this.getMemoryUsage();
    
    const result = await operation();
    
    const endTime = Date.now();
    const endMemory = this.getMemoryUsage();
    
    const duration = endTime - startTime;
    const memoryUsed = endMemory - startMemory;
    
    let throughput = 0;
    if (Array.isArray(result)) {
      throughput = result.length / (duration / 1000);
    }
    
    const benchmark = {
      duration,
      memoryUsed,
      throughput,
      timestamp: Date.now()
    };
    
    this.results.push(benchmark);
    
    return benchmark;
  }

  async measureLatency(operation, iterations = 100) {
    const latencies = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await operation();
      const end = performance.now();
      
      latencies.push(end - start);
    }
    
    return {
      average: this.average(latencies),
      median: this.median(latencies),
      p95: this.percentile(latencies, 95),
      p99: this.percentile(latencies, 99),
      min: Math.min(...latencies),
      max: Math.max(...latencies)
    };
  }

  getMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  average(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  median(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    
    return sorted[mid];
  }

  percentile(arr, p) {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  }

  getResults() {
    return this.results;
  }

  reset() {
    this.results = [];
  }

  generateReport() {
    if (this.results.length === 0) {
      return 'No benchmark results available';
    }
    
    const durations = this.results.map(r => r.duration);
    const throughputs = this.results.map(r => r.throughput);
    
    return {
      totalRuns: this.results.length,
      averageDuration: this.average(durations),
      averageThroughput: this.average(throughputs),
      medianDuration: this.median(durations),
      p95Duration: this.percentile(durations, 95)
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceBenchmark;
}
