let instance: TailwindCss | null = null;

export class TailwindCss {
  static get instance() {
    if (!instance) {
      instance = new TailwindCss();
    }
    return instance;
  }

  merge(...classes: (string | null | undefined)[]): string {
    return Array.from(
      new Set(
        classes
          .filter((f) => f !== null && f !== undefined)
          .map((c) => {
            return c.split(' ');
          })
          .flat(),
      ),
    ).join(' ');
  }
}
