import axios from 'axios';
import { API_URL } from '../config';

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const createQuotation = (data: unknown) =>
  axios.post(`${API_URL}/api/quotations`, data, authHeader());

export const getQuotations = (page = 1) =>
  axios.get(`${API_URL}/api/quotations?page=${page}&limit=20`, authHeader());

export const getQuotationById = (id: string) =>
  axios.get(`${API_URL}/api/quotations/${id}`, authHeader());

export const getPublicQuotation = (id: string) =>
  axios.get(`${API_URL}/api/quotations/public/${id}`);

export const updateQuotationSelection = (id: string, selectedItems: unknown[]) =>
  axios.patch(`${API_URL}/api/quotations/${id}/selection`, { selectedItems }, authHeader());

export const publicUpdateSelection = (id: string, selectedItems: unknown[]) =>
  axios.patch(`${API_URL}/api/quotations/public/${id}/selection`, { selectedItems });

export const finalizeQuotation = (id: string) =>
  axios.patch(`${API_URL}/api/quotations/${id}/finalize`, {}, authHeader());
