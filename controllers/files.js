const handleListFile = (req, res) => {
    const readline = require('readline');
    const {google} = require('googleapis');
    const fs = require("fs");
    const async = require("async");

    // If modifying these scopes, delete token.json.
    const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
    // The file token.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the first
    // time.
    const TOKEN_PATH = 'token.json';

    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Drive API.
    authorize(JSON.parse(content), listFiles);
    });

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
    }

    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) return console.error(err);
            console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
        });
    });
    }

    //LIST ALL FILES FROM A FOLDER
    function listFiles(auth){
        const drive = google.drive({version: 'v3', auth});
        var pageToken = null;
        // Using the NPM module 'async'
        async.doWhilst(function (callback) {
        drive.files.list({
            //q: `'${req.params.folderId}' in parents and trashed = false`,
            q: `trashed = false`,
            fields: 'nextPageToken, files(id, name, createdTime, parents, appProperties)',
            spaces: 'drive',
            orderBy: "createdTime asc",
            pageToken: pageToken
        }, function (err, response) {
            if (err) {
            // Handle error
            console.error(err);
            callback(err)
            } else {
                let files = [];
                if(req.params.user === "ADMIN"){
                    const filterFiles = response.data.files.filter(file => file.name !== "TEMPLATE");
                    files = filterFiles.map(file => {
                        return { 
                             name: file.name, 
                             link: "https://docs.google.com/spreadsheets/d/"+file.id, 
                             id: file.id, 
                             createdTime: file.createdTime
                         }
                     })
                }else{
                    const filterFiles = response.data.files.filter(file => file.appProperties.createdBy === req.params.user);
                    files = filterFiles.map(file => {
                       return { 
                            name: file.name, 
                            link: "https://docs.google.com/spreadsheets/d/"+file.id, 
                            id: file.id, 
                            createdTime: file.createdTime
                        }
                    })
                }
               
                res.status(200).json(files);
            
            pageToken = res.nextPageToken;
            callback();
            }
        });
        }, function () {
        return !!pageToken;
        }, function (err) {
        if (err) {
            // Handle error
            console.error(err);
        } else {
            // All pages fetched
        }
        })
    }


}

module.exports = {
    handleListFile: handleListFile
}