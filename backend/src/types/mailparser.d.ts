declare module 'mailparser' {
  export interface ParsedMail {
    attachments: Attachment[];
    from?: AddressObject | null;
    to?: AddressObject | null;
    cc?: AddressObject | null;
    bcc?: AddressObject | null;
    subject?: string;
    text?: string;
    html?: string | false;
    date?: Date;
    messageId?: string;
    inReplyTo?: string;
    references?: string[];
    headers: Map<string, any>;
    textAsHtml?: string;
    priority?: 'high' | 'normal' | 'low';
    replyTo?: AddressObject | null;
    attachmentsCalendarEvents?: CalendarComponent[];
  }

  export interface Attachment {
    contentType: string;
    contentDisposition?: string;
    filename?: string;
    contentId?: string;
    checksum?: string;
    size: number;
    content: Buffer | string;
    headers: Map<string, any>;
    related?: boolean;
    cid?: string;
    contentStream?: NodeJS.ReadableStream;
  }

  export interface AddressObject {
    value: Address[];
    text: string;
    html: string;
  }

  export interface Address {
    name?: string;
    address: string;
  }

  export interface CalendarComponent {
    method?: string;
    component: string;
    raw: string | Buffer;
  }

  export interface SimpleParserOptions {
    skipHtmlToText?: boolean;
    skipTextToHtml?: boolean;
    skipImageLinks?: boolean;
    formatDateHeaders?: boolean;
    formatDateFields?: boolean;
    keepDeliveryStatusNotification?: boolean;
    keepDeliveryStatusNotificationFields?: boolean;
    skipTextLinks?: boolean;
    skipInlineAttachments?: boolean;
    streamAttachments?: boolean;
    defaultCharset?: string;
    iconv?: any;
    maxHtmlLengthToParse?: number;
    maxTextLengthToParse?: number;
  }

  export function simpleParser(stream: NodeJS.ReadableStream | string | Buffer, options?: SimpleParserOptions): Promise<ParsedMail>;
  export function simpleParser(
    stream: NodeJS.ReadableStream | string | Buffer,
    options: SimpleParserOptions | undefined,
    callback: (err: Error | null, mail: ParsedMail) => void
  ): void;

  export class MailParser {
    constructor(options?: SimpleParserOptions);
    write(chunk: string | Buffer): void;
    end(chunk?: string | Buffer): void;
    on(event: 'headers', callback: (headers: Map<string, any>) => void): void;
    on(event: 'data', callback: (data: { type: string; [key: string]: any }) => void): void;
    on(event: 'end', callback: () => void): void;
  }
} 
