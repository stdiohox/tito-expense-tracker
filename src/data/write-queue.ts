/**
 * Runs async writes one at a time, in the order they were asked for. A write that fails rejects
 * its own promise and doesn't stop the ones after it.
 */
export class WriteQueue {
  private tail: Promise<unknown> = Promise.resolve();

  run<T>(task: () => Promise<T>): Promise<T> {
    const result = this.tail.then(task);
    this.tail = result.catch(() => {});
    return result;
  }
}
