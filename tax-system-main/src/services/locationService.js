// src/services/locationService.js

import axios from "axios";

const API_URL = "http://localhost:5179/api/Locations";

export const getGovernorates = async () => {
  const res = await axios.get(`${API_URL}/governorates`);
  return res.data;
};

export const getCenters = async (govId) => {
  const res = await axios.get(`${API_URL}/centers/${govId}`);
  return res.data;
};

export const getStreets = async (centerId) => {
  const res = await axios.get(`${API_URL}/streets/${centerId}`);
  return res.data;
};

export const getNeighborhoods = async (centerId) => {
  const res = await axios.get(`${API_URL}/neighborhoods/${centerId}`);
  return res.data;
};