export const checkEnvVariables = () => {
  const slackBotToken = process.env.SLACK_BOT_TOKEN;
  const slackAppToken = process.env.SLACK_APP_TOKEN;
  const clovaInvokeUrl = process.env.CLOVA_INVOKE_URL;
  const clovaSecretKey = process.env.CLOVA_SECRET_KEY;
  const backendUrl = process.env.BACKEND_URL;

  if (
    !slackBotToken ||
    !slackAppToken ||
    !clovaInvokeUrl ||
    !clovaSecretKey ||
    !backendUrl
  ) {
    throw new Error('Required environment variables are missing');
  }

  return {
    slackBotToken,
    slackAppToken,
    clovaInvokeUrl,
    clovaSecretKey,
    backendUrl,
  };
};
