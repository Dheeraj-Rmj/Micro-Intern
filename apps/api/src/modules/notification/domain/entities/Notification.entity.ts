import { NotificationChannel } from "@microintern/shared";

export interface NotificationProps {
  id?: string;
  userId: string;
  channel?: NotificationChannel;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead?: boolean;
  readAt?: Date | null;
  sentAt?: Date | null;
  createdAt?: Date;
}

export class Notification {
  public readonly id: string;
  public readonly userId: string;
  public readonly channel: NotificationChannel;
  public readonly type: string;
  public readonly title: string;
  public readonly body: string;
  public readonly data: Record<string, unknown>;
  public isRead: boolean;
  public readAt: Date | null;
  public sentAt: Date | null;
  public readonly createdAt: Date;

  private constructor(props: {
    id: string;
    userId: string;
    channel: NotificationChannel;
    type: string;
    title: string;
    body: string;
    data: Record<string, unknown>;
    isRead: boolean;
    readAt: Date | null;
    sentAt: Date | null;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.channel = props.channel;
    this.type = props.type;
    this.title = props.title;
    this.body = props.body;
    this.data = props.data;
    this.isRead = props.isRead;
    this.readAt = props.readAt;
    this.sentAt = props.sentAt;
    this.createdAt = props.createdAt;
  }

  public static create(props: NotificationProps): Notification {
    if (!props.userId || props.userId.trim() === "") {
      throw new Error("Notification requires a valid userId");
    }
    if (!props.title || props.title.trim() === "") {
      throw new Error("Notification requires a non-empty title");
    }
    if (!props.body || props.body.trim() === "") {
      throw new Error("Notification requires a non-empty body");
    }

    return new Notification({
      id: props.id || crypto.randomUUID(),
      userId: props.userId.trim(),
      channel: props.channel || NotificationChannel.IN_APP,
      type: props.type.trim(),
      title: props.title.trim(),
      body: props.body.trim(),
      data: props.data || {},
      isRead: props.isRead !== undefined ? props.isRead : false,
      readAt: props.readAt !== undefined ? props.readAt : null,
      sentAt: props.sentAt !== undefined ? props.sentAt : new Date(),
      createdAt: props.createdAt || new Date(),
    });
  }

  public markAsRead(): void {
    if (!this.isRead) {
      this.isRead = true;
      this.readAt = new Date();
    }
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      userId: this.userId,
      channel: this.channel,
      type: this.type,
      title: this.title,
      body: this.body,
      data: this.data,
      isRead: this.isRead,
      readAt: this.readAt?.toISOString() || null,
      sentAt: this.sentAt?.toISOString() || null,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
