import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tend.onrender.com/api/v1';

export interface IntegrationStatus {
  connected: boolean;
}

export const initiateOAuth = async (provider: string): Promise<string> => {
  const response = await axios.get(`${API_URL}/integrations/${provider}/auth`);
  return response.data.auth_url;
};

export const getIntegrationStatus = async (provider: string): Promise<IntegrationStatus> => {
  const response = await axios.get(`${API_URL}/integrations/${provider}/status`);
  return response.data;
}; 