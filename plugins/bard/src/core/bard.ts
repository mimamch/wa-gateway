let session: any, SNlM0e: any;

export const init = async (sessionID: any) => {
  session = {
    baseURL: "https://bard.google.com",
    headers: {
      Host: "bard.google.com",
      "X-Same-Domain": "1",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      Origin: "https://bard.google.com",
      Referer: "https://bard.google.com/",
      Cookie: `__Secure-1PSID=${sessionID};`,
    },
  };

  const response = await fetch("https://bard.google.com/", {
    method: "GET",
    headers: session.headers,
    credentials: "include",
  });

  const data = await response.text();
  const match = data.match(/SNlM0e":"(.*?)"/);

  if (match) SNlM0e = match[1];
  else throw new Error("Could not get Google Bard.");

  return SNlM0e;
};

export const queryBard = async (message: any, ids: any = {}) => {
  if (!SNlM0e)
    throw new Error("Make sure to call Bard.init(SESSION_ID) first.");

  // Parameters and POST data
  const params: any = {
    bl: "boq_assistant-bard-web-server_20230711.08_p0",
    _reqID: ids._reqID ? `${ids._reqID}` : "0",
    rt: "c",
  };

  const messageStruct = [
    [message],
    null,
    ids ? Object.values(ids).slice(0, 3) : [null, null, null],
  ];

  const data: any = {
    "f.req": JSON.stringify([null, JSON.stringify(messageStruct)]),
    at: SNlM0e,
  };

  let url = new URL(
    "/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate",
    session.baseURL
  );

  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key])
  );

  let formBody: any = [];

  for (let property in data) {
    let encodedKey = encodeURIComponent(property);
    let encodedValue = encodeURIComponent(data[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }

  formBody = formBody.join("&");

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: session.headers,
    body: formBody,
    credentials: "include",
  });

  const responseData = await response.text();

  const chatData = JSON.parse(responseData.split("\n")[3])[0][2];

  // Check if there is data
  if (!chatData) {
    throw new Error(`Google Bard encountered an error ${responseData}.`);
  }

  // Get important data, and update with important data if set to do so
  const parsedChatData = JSON.parse(chatData);
  const bardResponseData: any = JSON.parse(chatData)[4][0];

  let text = bardResponseData[1][0];

  let images = bardResponseData[4]?.map((x: any) => {
    return {
      tag: x[2],
      url: x[3][0][0],
      source: {
        original: x[0][0][0],
        website: x[1][0][0],
        name: x[1][1],
        favicon: x[1][3],
      },
    };
  });

  return {
    content: formatMarkdown(text, images),
    images: images,
    ids: {
      // Make sure kept in order, because using Object.keys() to query above
      conversationID: parsedChatData[1][0],
      responseID: parsedChatData[1][1],
      choiceID: parsedChatData[4][0][0],
      _reqID: parseInt(ids._reqID ?? 0) + 100000,
    },
  };
};

const formatMarkdown = (text: any, images: any) => {
  if (!images) return text;

  for (let imageData of images) {
    const formattedTag = `!${imageData.tag}(${imageData.url})`;
    text = text.replace(
      new RegExp(
        "(?<!!)" + imageData.tag.replace("[", "\\[").replace("]", "\\]")
      ),
      formattedTag
    );
  }

  return text;
};

export const askAI = async (message: any, useJSON = false) => {
  if (useJSON) return await queryBard(message);
  else return (await queryBard(message)).content;
};

export class Chat {
  constructor(ids?: any) {
    this.ids = ids;
  }
  ids: any;

  async ask(message: any, useJSON = false) {
    let request = await queryBard(message, this.ids);
    this.ids = { ...request.ids };
    if (useJSON) return request;
    else return request.content;
  }

  export() {
    return this.ids;
  }
}

export default { init, askAI, Chat };
