declare module 'axe-playwright' {
  import type { Page } from '@playwright/test';

  export function injectAxe(page: Page): Promise<void>;
  export function checkA11y(page: Page, selector?: string): Promise<void>;
}
