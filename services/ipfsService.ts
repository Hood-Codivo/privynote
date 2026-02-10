export class IPFSService {
  private static API_ENDPOINT = 'https://api.web3.storage';
  
  static async uploadEncryptedData(encryptedData: string, apiToken: string): Promise<string> {
    console.log('[IPFS] Uploading encrypted data to IPFS...');
    
    try {
      const blob = new Blob([encryptedData], { type: 'application/octet-stream' });
      const file = new File([blob], 'encrypted-note.bin', { type: 'application/octet-stream' });
      
      const formData = new FormData();
      formData.append('file', file as any);

      const response = await fetch(`${this.API_ENDPOINT}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`IPFS upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      const cid = data.cid;
      
      console.log('[IPFS] Upload successful. CID:', cid);
      return cid;
    } catch (error) {
      console.error('[IPFS] Upload error:', error);
      throw new Error('Failed to upload to IPFS');
    }
  }

  static async downloadEncryptedData(cid: string): Promise<string> {
    console.log('[IPFS] Downloading encrypted data from IPFS. CID:', cid);
    
    try {
      const response = await fetch(`https://w3s.link/ipfs/${cid}`);
      
      if (!response.ok) {
        throw new Error(`IPFS download failed: ${response.statusText}`);
      }

      const encryptedData = await response.text();
      console.log('[IPFS] Download successful');
      return encryptedData;
    } catch (error) {
      console.error('[IPFS] Download error:', error);
      throw new Error('Failed to download from IPFS');
    }
  }

  static async uploadJSON(data: any, apiToken: string): Promise<string> {
    console.log('[IPFS] Uploading JSON to IPFS...');
    const jsonString = JSON.stringify(data);
    return this.uploadEncryptedData(jsonString, apiToken);
  }
}
