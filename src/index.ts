import { config } from 'dotenv';
import SlackService from './services/slack-service';
config();

const slackToken = process.env.SLACK_BOT_TOKEN;
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;

if (!slackToken || !slackSigningSecret) {
  console.error('Slack token or signing secret are required.');
  process.exit(1);
}

const slackService = new SlackService(slackToken, slackSigningSecret);

slackService.start(process.env.PORT || 3000);
