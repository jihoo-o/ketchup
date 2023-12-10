import {
  App,
  FileSharedEvent,
  LogLevel,
  Middleware,
  SlackEventMiddlewareArgs,
} from '@slack/bolt';

export class SlackService {
  private app: App;

  constructor(botToken: string, appToken: string) {
    this.app = new App({
      token: botToken,
      appToken: appToken,
      socketMode: true,
      // logLevel: LogLevel.DEBUG,
    });

    this.registerEventHandlers();
  }

  private registerEventHandlers(): void {
    this.app.event('file_shared', this.handleFileSharedEvent.bind(this));
  }

  private handleFileSharedEvent: Middleware<
    SlackEventMiddlewareArgs<'file_shared'>
  > = async ({ event, client }) => {
    const { file, channel_id } = event as FileSharedEvent;

    console.log(`A file was shared in the target channel: ${file.id}`);
  };

  public async sendMessage(channel: string, text: string) {
    await this.app.client.chat.postMessage({
      channel,
      text,
    });
  }

  public async reactToMessage(
    channel: string,
    timestamp: string,
    reaction: string
  ) {
    await this.app.client.reactions.add({
      channel,
      timestamp,
      name: reaction,
    });
  }

  public async createChannel(name: string) {
    await this.app.client.conversations.create({
      name,
    });
  }

  public async inviteUserToChannel(channel: string, user: string) {
    await this.app.client.conversations.invite({
      channel,
      users: user,
    });
  }

  public async start() {
    await this.app.start();

    try {
      await this.sendMessage('general', '⚡️ Bolt app is running!');
      console.log('Message sent to general channel.');
    } catch (error) {
      console.error(`Failed to send message: ${error}`);
    }
  }
}

export default SlackService;
