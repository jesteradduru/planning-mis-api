const generateReport = (req, res) => {
    const fs = require('fs');
    const readline = require('readline');
    const {google} = require('googleapis');

    // If modifying these scopes, delete token.json.
    const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.file'];
    // The file token.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the first
    // time.
    const TOKEN_PATH = 'token.json';

    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), genReport);
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
        if (err) return getNewToken(oAuth2Client, callback);
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
    function getNewToken(oAuth2Client, callback) {
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
        if (err) return console.error('Error while trying to retrieve access token', err);
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

    /**
     * Prints the names and majors of students in a sample spreadsheet:
     * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
     * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
     */



    function genReport(auth) {
        const sheets = google.sheets({version: 'v4', auth});

        const livestockRanges = [ "GX10", "JU10", "GX644", "JU644", "GX661", "JU661" ]
        const repLivestockRanges = [ "C10", "E10", "C13", "E13", "C12", "E12" ]
        const cornRanges = [ "EJ12", "FS12", "EJ32", "FS32", "EJ56", "FS56" ]
        const repCornRanges = [ "C3", "E3", "C5", "E5", "C6", "E6" ]

        sheets.spreadsheets.values.batchGet({
            spreadsheetId: req.params.livestock,
            ranges: livestockRanges,
        }, (err, result) => {
            if (err) {
                // Handle error
                console.log(err);
            } else {
                const { valueRanges } =  result.data;
                const rangeVal = valueRanges.map(value => {
                    return value.values.flat()[0]
                });

                let values = [
                    [ rangeVal[0],, rangeVal[1] ],
                    [],
                    [ rangeVal[2],, rangeVal[3] ],
                    [ rangeVal[4],, rangeVal[5] ],
                ];
                const resource = {values};

                sheets.spreadsheets.values.update({
                    spreadsheetId: "1CsTYuWjhOB2vgbSnhOXeApaGSD1HwqSwpJ4ZLf4HKX4",
                    range: "C10",
                    valueInputOption: "USER_ENTERED",
                    resource,
                }, (err, result) => {

                    if (err) {
                        // Handle error
                        console.log(err);
                    } else {
                        // console.log('%d cells updated.', result.updatedCells);
                    }
                
                }); //SHEET UPDATE

            }
        
        });//batch get

        sheets.spreadsheets.values.batchGet({
            spreadsheetId: req.params.corn,
            ranges: cornRanges,
          }, (err, result) => {
            if (err) {
              // Handle error
              console.log(err);
            } else {
                const { valueRanges } =  result.data;

                const rangeVal = valueRanges.map(value => {
                    return value.values.flat()[0]
                });

                let values = [
                    [ rangeVal[0],,rangeVal[1] ],
                    [],
                    [ rangeVal[2],,rangeVal[3] ],
                    [ rangeVal[4],,rangeVal[5] ],
                ];
                const resource = {values};

                sheets.spreadsheets.values.update({
                    spreadsheetId: "1CsTYuWjhOB2vgbSnhOXeApaGSD1HwqSwpJ4ZLf4HKX4",
                    range: "C3",
                    valueInputOption: "USER_ENTERED",
                    resource,
                }, (err, result) => {
                if (err) {
                    // Handle error
                    console.log(err);
                } else {
                    // console.log('%d cells updated.', result.updatedCells);
                    res.status(200).json("1CsTYuWjhOB2vgbSnhOXeApaGSD1HwqSwpJ4ZLf4HKX4")
                }
                }); //SHEET UPDATE

            }
        }); //batch get
        
    }
    
}//handleGenReport

module.exports = {
    handleGenerateReport: generateReport
}