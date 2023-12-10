import { App, MessageEvent } from '@slack/bolt';

export class SlackService {
  private app: App;

  constructor(token: string, signingSecret: string) {
    this.app = new App({
      token,
      signingSecret,
    });
  }

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

  public async start(port: number | string) {
    await this.app.start(port);
    console.log('⚡️ SlackService is running!');

    // general 채널에 메시지 보내서 앱 연결 테스트하기
    try {
      await this.sendMessage('general', 'Hello, world!');
      console.log('Message sent to general channel.');
    } catch (error) {
      console.error(`Failed to send message: ${error}`);
    }
  }
}

export default SlackService;
