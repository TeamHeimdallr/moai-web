import axios from 'axios';

import { API_URL } from '~/constants';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-type': 'application/json',
  },
  withCredentials: true,
});

export const apiForm = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-type': 'multipart/form-data',
  },
  withCredentials: true,
});
