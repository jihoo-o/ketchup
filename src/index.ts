import express from 'express';
import bodyParser from 'body-parser';
import { config } from 'dotenv';
import SlackService from './services/slack-service';

config();

const app = express();

app.use(bodyParser.json());

const slackToken = process.env.SLACK_BOT_TOKEN;
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;

if (!slackToken || !slackSigningSecret) {
  console.error('Slack token or signing secret are required.');
  process.exit(1);
}

const slackService = new SlackService(slackToken, slackSigningSecret);

app.post('/', (req, res) => {
  // Check for the URL verification challenge
  if (req.body.type === 'url_verification') {
    res.send({
      challenge: req.body.challenge,
    });
  } else {
    // Handle other types of events
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
