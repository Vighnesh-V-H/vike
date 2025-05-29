import { google } from "googleapis";

// Define the OAuth2Client type
type OAuth2Client = InstanceType<typeof google.auth.OAuth2>;

/**
 * Get all Google Sheets from the user's Drive
 */
export async function getSheets(oauth2Client: OAuth2Client) {
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  const res = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.spreadsheet'",
    fields: "files(id, name, webViewLink, createdTime, modifiedTime)",
  });

  return res.data.files || [];
}

/**
 * Create a new Google Sheet
 */
export async function createSheet(oauth2Client: OAuth2Client, title: string) {
  const sheets = google.sheets({ version: "v4", auth: oauth2Client });

  const resource = {
    properties: {
      title,
    },
  };

  const response = await sheets.spreadsheets.create({
    requestBody: resource,
  });

  return response.data;
}

/**
 * Get data from a specific Google Sheet
 */
export async function getSheetData(
  oauth2Client: OAuth2Client,
  spreadsheetId: string,
  range: string = "Sheet1!A1:Z1000"
) {
  const sheets = google.sheets({ version: "v4", auth: oauth2Client });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  return response.data.values || [];
}

/**
 * Update data in a Google Sheet
 */
export async function updateSheetData(
  oauth2Client: OAuth2Client,
  spreadsheetId: string,
  range: string,
  values: any[][]
) {
  const sheets = google.sheets({ version: "v4", auth: oauth2Client });

  const response = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values,
    },
  });

  return response.data;
}

/**
 * Append data to a Google Sheet
 */
export async function appendSheetData(
  oauth2Client: OAuth2Client,
  spreadsheetId: string,
  range: string,
  values: any[][]
) {
  const sheets = google.sheets({ version: "v4", auth: oauth2Client });

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values,
    },
  });

  return response.data;
}

/**
 * Create a new sheet tab within a spreadsheet
 */
export async function addSheetTab(
  oauth2Client: OAuth2Client,
  spreadsheetId: string,
  title: string
) {
  const sheets = google.sheets({ version: "v4", auth: oauth2Client });

  const response = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title,
            },
          },
        },
      ],
    },
  });

  return response.data;
}

/**
 * Format cells in a Google Sheet
 */
export async function formatSheetCells(
  oauth2Client: OAuth2Client,
  spreadsheetId: string,
  sheetId: number,
  startRowIndex: number,
  endRowIndex: number,
  startColumnIndex: number,
  endColumnIndex: number,
  backgroundColor?: { red: number; green: number; blue: number },
  textFormat?: {
    bold?: boolean;
    italic?: boolean;
    fontFamily?: string;
    fontSize?: number;
  }
) {
  const sheets = google.sheets({ version: "v4", auth: oauth2Client });

  const requests = [];

  if (backgroundColor) {
    requests.push({
      updateCells: {
        range: {
          sheetId,
          startRowIndex,
          endRowIndex,
          startColumnIndex,
          endColumnIndex,
        },
        rows: [
          {
            values: [
              {
                userEnteredFormat: {
                  backgroundColor,
                },
              },
            ],
          },
        ],
        fields: "userEnteredFormat.backgroundColor",
      },
    });
  }

  if (textFormat) {
    requests.push({
      updateCells: {
        range: {
          sheetId,
          startRowIndex,
          endRowIndex,
          startColumnIndex,
          endColumnIndex,
        },
        rows: [
          {
            values: [
              {
                userEnteredFormat: {
                  textFormat,
                },
              },
            ],
          },
        ],
        fields: "userEnteredFormat.textFormat",
      },
    });
  }

  if (requests.length === 0) {
    return null;
  }

  const response = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests,
    },
  });

  return response.data;
}
