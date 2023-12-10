import { config } from 'dotenv';
import SlackService from './services/slack-service';
import { checkEnvVariables } from './utils/config';

config();

const start = async () => {
  const { slackBotToken, slackAppToken } = checkEnvVariables();

  const app = new SlackService(slackBotToken, slackAppToken);
  await app.start();
};

start();
