declare module 'puppeteer' {
  export interface Browser {
    newPage(): Promise<Page>;
    close(): Promise<void>;
    pages(): Promise<Page[]>;
    version(): Promise<string>;
    userAgent(): Promise<string>;
    waitForTarget(predicate: (target: Target) => boolean, options?: { timeout?: number }): Promise<Target>;
  }

  export interface Target {
    browser(): Browser;
    page(): Promise<Page | null>;
    url(): string;
    type(): string;
  }

  export interface Page {
    goto(url: string, options?: NavigationOptions): Promise<Response | null>;
    close(): Promise<void>;
    content(): Promise<string>;
    setContent(html: string, options?: NavigationOptions): Promise<void>;
    url(): string;
    title(): Promise<string>;
    waitForNavigation(options?: NavigationOptions): Promise<Response>;
    waitForSelector(selector: string, options?: WaitForSelectorOptions): Promise<ElementHandle>;
    waitForTimeout(milliseconds: number): Promise<void>;
    waitForXPath(xpath: string, options?: WaitForSelectorOptions): Promise<ElementHandle>;
    waitForFunction(pageFunction: Function | string, options?: { timeout?: number; polling?: string | number }, ...args: any[]): Promise<JSHandle>;

    // DOM interaction methods
    $(selector: string): Promise<ElementHandle | null>;
    $$(selector: string): Promise<ElementHandle[]>;
    $eval<R>(selector: string, pageFunction: (element: Element, ...args: any[]) => R, ...args: any[]): Promise<R>;
    $$eval<R>(selector: string, pageFunction: (elements: Element[], ...args: any[]) => R, ...args: any[]): Promise<R>;
    $x(expression: string): Promise<ElementHandle[]>;
    evaluate<R>(pageFunction: Function | string, ...args: any[]): Promise<R>;
    evaluateHandle(pageFunction: Function | string, ...args: any[]): Promise<JSHandle>;

    // Input methods
    click(selector: string, options?: ClickOptions): Promise<void>;
    focus(selector: string): Promise<void>;
    hover(selector: string): Promise<void>;
    select(selector: string, ...values: string[]): Promise<string[]>;
    tap(selector: string): Promise<void>;
    type(selector: string, text: string, options?: { delay: number }): Promise<void>;

    // Page state methods
    cookies(...urls: string[]): Promise<Cookie[]>;
    setCookie(...cookies: Cookie[]): Promise<void>;
    deleteCookie(...cookies: Cookie[]): Promise<void>;
    
    // Screenshot methods
    screenshot(options?: ScreenshotOptions): Promise<Buffer>;
    
    // Dialog handling
    on(event: 'dialog', handler: (dialog: Dialog) => Promise<void>): void;
    
    // Execution context
    mainFrame(): Frame;
    frames(): Frame[];
  }

  export interface NavigationOptions {
    timeout?: number;
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2' | string[];
  }

  export interface WaitForSelectorOptions {
    visible?: boolean;
    hidden?: boolean;
    timeout?: number;
  }

  export interface ClickOptions {
    button?: 'left' | 'right' | 'middle';
    clickCount?: number;
    delay?: number;
  }

  export interface Cookie {
    name: string;
    value: string;
    domain?: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax';
  }

  export interface ScreenshotOptions {
    path?: string;
    type?: 'jpeg' | 'png';
    quality?: number;
    fullPage?: boolean;
    clip?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    omitBackground?: boolean;
    encoding?: 'binary' | 'base64';
  }

  export interface ElementHandle extends JSHandle {
    $(selector: string): Promise<ElementHandle | null>;
    $$(selector: string): Promise<ElementHandle[]>;
    $eval<R>(selector: string, pageFunction: (element: Element, ...args: any[]) => R, ...args: any[]): Promise<R>;
    $$eval<R>(selector: string, pageFunction: (elements: Element[], ...args: any[]) => R, ...args: any[]): Promise<R>;
    boundingBox(): Promise<{ x: number; y: number; width: number; height: number } | null>;
    click(options?: ClickOptions): Promise<void>;
    focus(): Promise<void>;
    hover(): Promise<void>;
    press(key: string, options?: { text?: string; delay?: number }): Promise<void>;
    screenshot(options?: ScreenshotOptions): Promise<Buffer>;
    tap(): Promise<void>;
    type(text: string, options?: { delay: number }): Promise<void>;
    uploadFile(...filePaths: string[]): Promise<void>;
  }

  export interface JSHandle {
    evaluate<R>(pageFunction: (element: any, ...args: any[]) => R, ...args: any[]): Promise<R>;
    getProperties(): Promise<Map<string, JSHandle>>;
    getProperty(propertyName: string): Promise<JSHandle>;
    jsonValue(): Promise<any>;
  }

  export interface Response {
    buffer(): Promise<Buffer>;
    json(): Promise<any>;
    text(): Promise<string>;
    ok: boolean;
    status(): number;
    statusText(): string;
    url(): string;
    headers(): Record<string, string>;
  }

  export interface Dialog {
    accept(promptText?: string): Promise<void>;
    dismiss(): Promise<void>;
    message(): string;
    type(): 'alert' | 'beforeunload' | 'confirm' | 'prompt';
  }

  export interface Frame {
    $(selector: string): Promise<ElementHandle | null>;
    $$(selector: string): Promise<ElementHandle[]>;
    $eval<R>(selector: string, pageFunction: (element: Element, ...args: any[]) => R, ...args: any[]): Promise<R>;
    $$eval<R>(selector: string, pageFunction: (elements: Element[], ...args: any[]) => R, ...args: any[]): Promise<R>;
    evaluate<R>(pageFunction: Function | string, ...args: any[]): Promise<R>;
    title(): Promise<string>;
    url(): string;
    waitForNavigation(options?: NavigationOptions): Promise<Response>;
    waitForSelector(selector: string, options?: WaitForSelectorOptions): Promise<ElementHandle>;
  }

  // For device emulation
  export interface Device {
    name: string;
    userAgent: string;
    viewport: {
      width: number;
      height: number;
      deviceScaleFactor: number;
      isMobile: boolean;
      hasTouch: boolean;
      isLandscape: boolean;
    };
  }

  export interface PuppeteerOptions {
    headless?: boolean;
    executablePath?: string;
    slowMo?: number;
    args?: string[];
    ignoreHTTPSErrors?: boolean;
    defaultViewport?: {
      width: number;
      height: number;
      deviceScaleFactor?: number;
      isMobile?: boolean;
      hasTouch?: boolean;
      isLandscape?: boolean;
    };
    handleSIGINT?: boolean;
    handleSIGTERM?: boolean;
    handleSIGHUP?: boolean;
    timeout?: number;
    dumpio?: boolean;
    userDataDir?: string;
    env?: Record<string, string | undefined>;
    devtools?: boolean;
  }

  export function launch(options?: PuppeteerOptions): Promise<Browser>;
  export function connect(options: { browserWSEndpoint?: string; browserURL?: string; ignoreHTTPSErrors?: boolean }): Promise<Browser>;
  export const devices: Record<string, Device>;
}

// For requiring puppeteer
declare module 'puppeteer/DeviceDescriptors' {
  import { Device } from 'puppeteer';
  const devices: Record<string, Device>;
  export = devices;
} 