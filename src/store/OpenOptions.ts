import { Schema } from "./types";
import { Upgrade } from "./Upgrade";

export interface OpenOptions<S extends Schema> {
  upgrade?(upgrade: Upgrade<S>): void | Promise<void>;
  blocked?(): void | Promise<void>;
  // We can't accept a promise for `blocking` because if it takes multiple
  // ticks to resolve the block, the opening attempt may have already thrown.
  // Forcing users to perform synchronous actions makes that case less likely.
  blocking?(): void;
  autoCloseOnBlocking?: boolean;
}
