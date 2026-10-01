import { HubConnectionBuilder, LogLevel, type HubConnection } from '@microsoft/signalr';
import { apiOrigin, isWeb, nativeUserAgent } from '../lib/config';
import { accessTokenForHub } from '../lib/session';
import type { LiveDelta } from '../lib/types';

type Listener = (delta: LiveDelta) => void;
type ResyncListener = () => void;

/**
 * One hub connection for the app. The server puts every connection in the public `offer` group (prices) and the
 * punter's own group (their coupons and payouts). A gap in a group's sequence, or a reconnect, asks views to re-read.
 */
class Live {
  private connection: HubConnection | null = null;
  private readonly listeners = new Set<Listener>();
  private readonly resyncListeners = new Set<ResyncListener>();
  private readonly last = new Map<string, number>();

  start(): void {
    if (this.connection) {
      return;
    }
    const connection = new HubConnectionBuilder()
      .withUrl(
        `${apiOrigin}/api/hubs/live`,
        isWeb
          ? { headers: { 'X-SwiftBets-Csrf': '1' }, withCredentials: true }
          : { accessTokenFactory: accessTokenForHub, headers: { 'User-Agent': nativeUserAgent } },
      )
      .withAutomaticReconnect([0, 1_000, 2_000, 5_000, 10_000, 15_000])
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on('delta', (delta: LiveDelta) => {
      const previous = this.last.get(delta.group);
      this.last.set(delta.group, Math.max(previous ?? 0, delta.sequence));
      if (previous !== undefined && delta.sequence !== previous + 1) {
        this.resyncListeners.forEach((listener) => listener());
      }
      this.listeners.forEach((listener) => listener(delta));
    });
    connection.onreconnected(() => {
      this.last.clear();
      this.resyncListeners.forEach((listener) => listener());
    });

    this.connection = connection;
    void this.connect(connection);
  }

  onDelta(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onResync(listener: ResyncListener): () => void {
    this.resyncListeners.add(listener);
    return () => this.resyncListeners.delete(listener);
  }

  private async connect(connection: HubConnection): Promise<void> {
    for (let attempt = 0; this.connection === connection; attempt++) {
      try {
        await connection.start();
        return;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, Math.min(15_000, 1_000 * 2 ** attempt)));
      }
    }
  }
}

export const live = new Live();
