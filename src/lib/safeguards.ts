/**
 * Resource Exhaustion Safeguards
 * 
 * Modular utilities to prevent runaway processes, uncontrolled loops,
 * and excessive resource usage across the NEU Access Hub.
 */

// ── Circuit Breaker: Stops cascading failures after N errors ──
export class CircuitBreaker {
  private failures = 0;
  private openUntil = 0;

  constructor(
    private readonly threshold: number = 5,
    private readonly cooldownMs: number = 30_000
  ) {}

  /** Returns true if the operation should proceed. */
  canProceed(): boolean {
    // Circuit is OPEN → reject until cooldown expires
    if (Date.now() < this.openUntil) return false;

    // Too many consecutive failures → trip the breaker
    if (this.failures >= this.threshold) {
      this.openUntil = Date.now() + this.cooldownMs;
      this.failures = 0;
      console.warn(
        `[CircuitBreaker] OPEN — halting operations for ${this.cooldownMs}ms`
      );
      return false;
    }

    return true;
  }

  /** Record a failure — increments toward the threshold. */
  recordFailure(): void {
    this.failures++;
  }

  /** Record a success — gradual recovery (decrement by 1). */
  recordSuccess(): void {
    this.failures = Math.max(0, this.failures - 1);
  }

  /** Check if the circuit is currently open (rejecting). */
  isOpen(): boolean {
    return Date.now() < this.openUntil;
  }
}

// ── Throttled Batch Processor: Caps concurrent operations ──
interface BatchOptions {
  /** Number of items to process per batch. Default: 10 */
  batchSize?: number;
  /** Maximum total items to process (hard cap). Default: 500 */
  maxItems?: number;
  /** Delay in ms between batches (throttle). Default: 100 */
  delayMs?: number;
}

/**
 * Processes items in controlled batches with throttling and a hard iteration cap.
 * Uses Promise.allSettled so a single item failure doesn't kill the batch.
 */
export async function processBatch<T>(
  items: T[],
  handler: (item: T) => Promise<void>,
  options: BatchOptions = {}
): Promise<{ succeeded: number; failed: number }> {
  const { batchSize = 10, maxItems = 500, delayMs = 100 } = options;

  // Hard iteration cap — prevent processing unbounded arrays
  const capped = items.slice(0, maxItems);
  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < capped.length; i += batchSize) {
    const batch = capped.slice(i, i + batchSize);
    const results = await Promise.allSettled(batch.map(handler));

    for (const result of results) {
      if (result.status === 'fulfilled') succeeded++;
      else failed++;
    }

    // Throttle: pause between batches to prevent overwhelming the backend
    if (i + batchSize < capped.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  if (items.length > maxItems) {
    console.warn(
      `[processBatch] Capped at ${maxItems}/${items.length} items. ` +
      `${items.length - maxItems} items were skipped.`
    );
  }

  return { succeeded, failed };
}

// ── Rate Limiter: Prevents feedback loops in loggers ──
export class RateLimiter {
  private count = 0;
  private windowStart = Date.now();

  constructor(
    /** Maximum operations allowed per window. Default: 20 */
    private readonly maxPerWindow: number = 20,
    /** Window duration in ms. Default: 60 seconds */
    private readonly windowMs: number = 60_000
  ) {}

  /** Returns true if the operation should proceed (within rate limits). */
  shouldProceed(): boolean {
    const now = Date.now();

    // Reset window if expired
    if (now - this.windowStart > this.windowMs) {
      this.count = 0;
      this.windowStart = now;
    }

    this.count++;
    return this.count <= this.maxPerWindow;
  }

  /** Get remaining quota in the current window. */
  remaining(): number {
    const now = Date.now();
    if (now - this.windowStart > this.windowMs) return this.maxPerWindow;
    return Math.max(0, this.maxPerWindow - this.count);
  }
}
