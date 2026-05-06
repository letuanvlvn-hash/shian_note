/**
 * Service to interact with Google Sheets via Apps Script Web App
 */

const API_URL = '/api/sheets';

export const googleSheetsService = {
  async checkConnection() {
    try {
      const response = await fetch('/api/debug/sheets');
      const debug = await response.json();
      console.log('Connection Diagnostic:', debug);
      return debug;
    } catch (error) {
      console.error('Diagnostic failed:', error);
      return null;
    }
  },

  async getAllData() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch data from proxy');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching data via proxy:', error);
      return null;
    }
  },

  async syncTable(table: string, data: any[]) {
    if (data.length === 0 && table !== 'Settings') {
      console.warn(`Skipping sync for ${table} because data is empty. This prevents accidental deletion.`);
      return;
    }

    console.log(`Syncing table ${table} via proxy...`);
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'syncTable',
          table,
          data,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Proxy error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      if (result.status === 'error') {
        throw new Error(result.message);
      }

      console.log(`Successfully synced ${table} via proxy.`);
      return true;
    } catch (error) {
      console.error(`Error syncing ${table} via proxy:`, error);
      return false;
    }
  },

  async syncAll(payload: any) {
    console.log('Syncing all data via proxy...');
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'syncAll',
          payload,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Proxy error! status: ${response.status}`);
      }
      
      console.log('Successfully synced all data via proxy.');
    } catch (error) {
      console.error('Error syncing all data via proxy:', error);
    }
  }
};
