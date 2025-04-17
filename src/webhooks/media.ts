import { MessageReceived } from "wa-multi-session";

const baseMediaPath = "./media/";

export const handleWebhookImageMessage = async (message: MessageReceived) => {
  if (message.message?.imageMessage) {
    const baseMediaName = `${message.key.id}`;

    const fileName = `${baseMediaName}.jpg`;
    await message.saveImage(baseMediaPath + fileName);
    return fileName;
  }
  return null;
};

export const handleWebhookVideoMessage = async (message: MessageReceived) => {
  if (message.message?.videoMessage) {
    const baseMediaName = `${message.key.id}`;

    const fileName = `${baseMediaName}.mp4`;
    await message.saveVideo(baseMediaPath + fileName);
    return fileName;
  }
  return null;
};

export const handleWebhookDocumentMessage = async (
  message: MessageReceived
) => {
  if (message.message?.documentMessage) {
    const baseMediaName = `${message.key.id}`;

    const fileName = `${baseMediaName}`;
    await message.saveDocument(baseMediaPath + fileName);
    return fileName;
  }
  return null;
};

export const handleWebhookAudioMessage = async (message: MessageReceived) => {
  if (message.message?.audioMessage) {
    const baseMediaName = `${message.key.id}`;

    const fileName = `${baseMediaName}.mp3`;
    await message.saveAudio(baseMediaPath + fileName);
    return fileName;
  }
  return null;
};
