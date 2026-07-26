import { FollowUpTracker } from './FollowUpTracker';
import { debugClearContactCache } from './contactConfig';
import type { ContactConfig } from './contactConfig';

/** Which part of the flow a debug trigger is asking for. */
export type DebugStage = 'teaser' | 'flow' | 'contact';

export interface DebugRequest {
  stage: DebugStage;
  /** Language code, e.g. 'ar'. Defaults to the device locale. */
  locale?: string;
  /** Preview specific handles without hitting the network. */
  config?: ContactConfig;
}

type Listener = (request: DebugRequest) => void;

const listeners = new Set<Listener>();

/** Subscribed by the mounted `FollowUpGate`. Not part of the public API. */
export function subscribeToDebugTriggers(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(request: DebugRequest) {
  if (listeners.size === 0) {
    console.warn(
      'follow_up: no mounted <FollowUpGate> to show the ' +
        `"${request.stage}" stage — is the app wrapped in one?`
    );
    return;
  }
  for (const listener of listeners) listener(request);
}

/** Shows the teaser popup immediately, skipping the open-count threshold and
 * the delay — so you can look at the UI without opening the app 40 times.
 * Doesn't touch the "already shown" flag, so the real gate still behaves
 * normally afterwards. */
export function debugShowTeaser(opts: { locale?: string } = {}): void {
  emit({ stage: 'teaser', ...opts });
}

/** Shows the five-scene flow immediately. */
export function debugShowFlow(opts: { locale?: string } = {}): void {
  emit({ stage: 'flow', ...opts });
}

/** Shows the contact screen immediately. Pass `config` to preview handles
 * without hitting the network. */
export function debugShowContact(opts: { locale?: string; config?: ContactConfig } = {}): void {
  emit({ stage: 'contact', ...opts });
}

/** Clears the open count, the "already shown" flag, and the cached contact
 * config, so the next launch behaves like a fresh install. */
export async function debugReset(): Promise<void> {
  const tracker = await FollowUpTracker.create();
  await tracker.debugReset();
  await debugClearContactCache();
}

/** Pretends the app has been opened `threshold` times, so the next
 * `FollowUpGate` mount triggers for real (after its own delay). */
export async function debugForceReady(threshold = 40): Promise<void> {
  const tracker = await FollowUpTracker.create();
  await tracker.debugForceReady({ threshold });
}
