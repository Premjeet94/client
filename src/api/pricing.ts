import axios from "axios";
import { API_URL } from "../config";

export const getLocations = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_URL}/api/pricing`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.locations;
};

export const getLocationById = (id: string) =>
  axios.get(`${API_URL}/api/pricing/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

export const createLocation = (data: any) =>
  axios.post(`${API_URL}/api/pricing`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

export const updateLocation = (id: string, data: any) =>
  axios.put(`${API_URL}/api/pricing/${id}`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

export const deleteLocation = (id: string) =>
  axios.delete(`${API_URL}/api/pricing/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
