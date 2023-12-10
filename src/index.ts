import { config } from 'dotenv';
import express from 'express';
import SlackService from './services/slack-service';
import { checkEnvVariables } from './utils/config';

config();

const start = async () => {
  const { slackBotToken, slackAppToken } = checkEnvVariables();

  const slackApp = new SlackService(slackBotToken, slackAppToken);
  await slackApp.start();

  const expressApp = express();
  expressApp.use(express.json());

  expressApp.post('/clova/callback', (req, res) => {
    console.log('Received data:', req.body.text);
    // TODO ready to call gpt
    slackApp.sendMessage('general', req.body.text);
    res.status(200).send('OK');
  });

  expressApp.listen(3001, () => {
    console.log('Express server is listening on port 3001');
  });
};

start();
