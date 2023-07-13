const axios = require('axios')

exports.sendWebhook = (url, data, method = 'POST') => {
  if(process.env.WEBHOOK_ENABLED) {
    return axios({
      method: method,
      url: url,
      data: data,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
  }
}