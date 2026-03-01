/**
 * Apify API Client for Chrome Extension
 * Lightweight client following Apify's official patterns
 * Based on: https://docs.apify.com/api/client/js
 */

class ApifyClient {
  constructor(options = {}) {
    this.token = options.token;
    this.baseUrl = 'https://api.apify.com/v2';
    this.timeout = options.timeout || 60000; // 60 seconds default
  }

  /**
   * Get actor client for specific actor
   */
  actor(actorId) {
    return new ActorClient(this, actorId);
  }

  /**
   * Make API request
   */
  async _request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Apify API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}

/**
 * Actor Client - handles actor-specific operations
 */
class ActorClient {
  constructor(apifyClient, actorId) {
    this.client = apifyClient;
    this.actorId = actorId;
  }

  /**
   * Call actor and wait for results (synchronous run)
   * This is the recommended way for getting immediate results
   */
  async call(input, options = {}) {
    // Convert actor ID format: "username/actor-name" -> "username~actor-name"
    const actorIdFormatted = this.actorId.replace('/', '~');
    const endpoint = `/acts/${actorIdFormatted}/run-sync-get-dataset-items?token=${this.client.token}`;
    
    console.log(`[ApifyClient] Calling actor: ${this.actorId}`);
    console.log(`[ApifyClient] Formatted actor ID: ${actorIdFormatted}`);
    console.log(`[ApifyClient] Input:`, input);

    const response = await this.client._request(endpoint, {
      method: 'POST',
      body: JSON.stringify(input)
    });

    console.log(`[ApifyClient] Response received:`, response);
    return response;
  }

  /**
   * Start actor run (asynchronous)
   * Use this for long-running tasks
   */
  async start(input, options = {}) {
    // Convert actor ID format: "username/actor-name" -> "username~actor-name"
    const actorIdFormatted = this.actorId.replace('/', '~');
    const endpoint = `/acts/${actorIdFormatted}/runs?token=${this.client.token}`;
    
    const response = await this.client._request(endpoint, {
      method: 'POST',
      body: JSON.stringify(input)
    });

    return new RunClient(this.client, response.data.id);
  }
}

/**
 * Run Client - handles run-specific operations
 */
class RunClient {
  constructor(apifyClient, runId) {
    this.client = apifyClient;
    this.runId = runId;
  }

  /**
   * Wait for run to finish
   */
  async waitForFinish(options = {}) {
    const maxWaitSecs = options.waitSecs || 60;
    const startTime = Date.now();

    while (true) {
      const run = await this.get();
      
      if (run.status === 'SUCCEEDED') {
        return run;
      }
      
      if (run.status === 'FAILED' || run.status === 'ABORTED' || run.status === 'TIMED-OUT') {
        throw new Error(`Run ${run.status}: ${run.statusMessage || 'Unknown error'}`);
      }

      const elapsedSecs = (Date.now() - startTime) / 1000;
      if (elapsedSecs > maxWaitSecs) {
        throw new Error(`Run timeout after ${maxWaitSecs} seconds`);
      }

      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  /**
   * Get run details
   */
  async get() {
    const endpoint = `/actor-runs/${this.runId}?token=${this.client.token}`;
    const response = await this.client._request(endpoint, { method: 'GET' });
    return response.data;
  }

  /**
   * Get dataset items from run
   */
  async dataset() {
    const run = await this.get();
    const datasetId = run.defaultDatasetId;
    
    if (!datasetId) {
      throw new Error('No dataset found for this run');
    }

    return new DatasetClient(this.client, datasetId);
  }
}

/**
 * Dataset Client - handles dataset operations
 */
class DatasetClient {
  constructor(apifyClient, datasetId) {
    this.client = apifyClient;
    this.datasetId = datasetId;
  }

  /**
   * List items in dataset
   */
  async listItems(options = {}) {
    const endpoint = `/datasets/${this.datasetId}/items?token=${this.client.token}`;
    return await this.client._request(endpoint, { method: 'GET' });
  }
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ApifyClient };
}
