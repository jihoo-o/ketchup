export const checkEnvVariables = () => {
  const slackBotToken = process.env.SLACK_BOT_TOKEN;
  const slackAppToken = process.env.SLACK_APP_TOKEN;

  if (!slackBotToken || !slackAppToken) {
    throw new Error('Required environment variables are missing');
  }

  return { slackBotToken, slackAppToken };
};
