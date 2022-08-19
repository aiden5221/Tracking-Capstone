require('dotenv').config({ path:'../.env' })

const createMsg = (response) => {
    let msg = {
        date : new Date(response.data.payload.headers.find(ele => ele.name === 'Date').value),
        sentFrom : (response.data.payload.headers.find(ele => ele.name === 'From').value),
        subject: (response.data.payload.headers.find(ele => ele.name === 'Subject').value),
        snippet : response.data.snippet,
        message : response.data.payload.body.size == 0 ? response.data.payload.parts[0].body.data : response.data.payload.body.data,
        occurences: 0,
    }
    if(typeof msg.message == 'undefined'){
        msg.message = response.data.payload.parts[0].parts.find(ele => ele.mimeType ==='text/plain').body.data
    }

    return msg;
}

var gmailCredentials = {
    "installed":
      {
          "client_id":process.env.client_id,
          "project_id":process.env.project_id,
          "auth_uri":"https://accounts.google.com/o/oauth2/auth",
          "token_uri":"https://oauth2.googleapis.com/token",
          "auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs",
          "client_secret":process.env.client_secret,
          "redirect_uris":["http://localhost"]
      }
}

var token = {
    "access_token":process.env.TOKEN_ACCESS_TOKEN,
    "refresh_token":process.env.TOKEN_REFRESH_TOKEN,
    "scope":"https://www.googleapis.com/auth/gmail.readonly",
    "token_type":"Bearer",
    "expiry_date":1660273261755
}

module.exports = { createMsg, gmailCredentials, token }