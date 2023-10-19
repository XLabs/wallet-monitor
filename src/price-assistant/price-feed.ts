import { Counter, Registry } from "prom-client";
import { Logger } from "winston";
import { printError } from "../utils";

const DEFAULT_FEED_INTERVAL = 10_000;
const DEFAULT_PRICE_PRECISION = 8;

export abstract class PriceFeed<K, V> {
  private name: string;
  private interval?: NodeJS.Timeout;
  private locked: boolean;
  private runIntervalMs: number;
  private metrics?: BasePriceFeedMetrics;
  protected pricePrecision: number;
  protected logger: Logger;

  constructor(name: string, logger: Logger, registry?: Registry, runIntervalMs?: number, pricePrecision?: number) {
    this.name = name;
    this.logger = logger;
    this.locked = false;
    this.runIntervalMs = runIntervalMs || DEFAULT_FEED_INTERVAL;
    if (registry) this.metrics = this.initMetrics(registry);
    this.pricePrecision = pricePrecision || DEFAULT_PRICE_PRECISION;
  }

  protected abstract update(): Promise<void>;

  protected abstract get(key: K): V;

  public start(): void {
    this.interval = setInterval(() => this.run(), this.runIntervalMs);
    this.run();
  }

  public stop(): void {
    clearInterval(this.interval);
  }

  public getKey(key: K): V {
    const result = this.get(key);
    if (result === undefined || result === null) throw new Error(`Key Not Found: ${key}`);
    return result;
  }

  private initMetrics(registry: Registry): BasePriceFeedMetrics {
    return {
      pricePollCounter: new Counter({
        name: `${this.name.toLowerCase()}_base_price_feed_poll_operations_total`,
        help: `Total number of price poll operations for feed ${this.name}`,
        registers: [registry],
        labelNames: ["status"],
      }),
    };
  }

  protected countPollOperations(status: "success" | "failure") {
    this.metrics?.pricePollCounter.labels({ status }).inc();
  }

  private async run() {
    if (this.locked) {
      this.logger.warn(`Feed is locked, skipping poll operation`);
      return;
    }

    this.locked = true;

    try {
      await this.update();
      this.countPollOperations("success");
    } catch (error) {
      this.logger.error(`Error trying to update feed data: ${printError(error)}`);
      this.countPollOperations("failure");
    } finally {
      this.locked = false;
    }
  }
}

type BasePriceFeedMetrics = {
  pricePollCounter: Counter<string>;
};
