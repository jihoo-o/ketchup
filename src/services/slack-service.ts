import {
  App,
  FileSharedEvent,
  LogLevel,
  Middleware,
  SlackEventMiddlewareArgs,
} from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import ClovaService from './clova-service';
import { checkEnvVariables } from '../utils/config';

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
    try {
      const { file, channel_id } = event as FileSharedEvent;

      const fileInfo = await client.files.info({
        file: file.id,
      });

      if (!fileInfo.file || !fileInfo.file.url_private) {
        console.log(`File info has a wrong value: ${file.id}`);
        return;
      }
      const fileType = fileInfo.file.mimetype;

      if (!fileType) {
        console.log(`File type not found: ${file.id}`);
        return;
      }
      if (fileType.startsWith('audio/')) {
        console.log(`Audio file detected: ${file.id}`);

        const fileDownloadedPath = await this.downloadFile(
          client,
          fileInfo.file.url_private
        );

        // REFACTOR
        const { clovaInvokeUrl, clovaSecretKey, backendUrl } =
          checkEnvVariables();
        const clovaService = new ClovaService(clovaInvokeUrl, clovaSecretKey);
        const result = await clovaService.recognizeSpeech(fileDownloadedPath, {
          language: 'ko-KR',
          callback: `${backendUrl}/clova/callback`,
          resultToObs: false,
        });
      }
    } catch (error) {
      console.error(`Failed to handle file_shared event: ${error}`);
    }
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

  private async downloadFile(client: WebClient, url: string): Promise<string> {
    try {
      const resp = await axios.get(url, {
        headers: { Authorization: `Bearer ${client.token}` },
        responseType: 'stream',
      });

      const downloadDir = path.resolve(__dirname, '../../download');
      fs.mkdirSync(downloadDir, { recursive: true });

      const currentDateTime = new Date().toISOString().replace(/:/g, '-');
      const filename = path.basename(url).replace(/\.[^/.]+$/, '');
      const localPath = path.join(
        downloadDir,
        `${filename}-${currentDateTime}.wav` // FIXME
      );

      await new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(localPath);
        resp.data.pipe(stream);
        console.log('Downloading file...');
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      console.log(`File downloaded to: ${localPath}`);
      return localPath;
    } catch (error) {
      console.error(`Failed to download file: ${error}`);
      return '';
    }
  }
}

export default SlackService;
