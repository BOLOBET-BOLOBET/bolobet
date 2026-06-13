import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function getSheet(sheetName) {
  const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
  const key = rawKey.includes('\\n') 
    ? rawKey.replace(/\\n/g, '\n')
    : rawKey;

  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();

  const sheet = doc.sheetsByTitle[sheetName];
  if (!sheet) {
    throw new Error(`Aba "${sheetName}" não encontrada na planilha.`);
  }
  return sheet;
}
