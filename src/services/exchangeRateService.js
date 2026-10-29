import api from './api';

// Backend caches this daily (see exchangeRateController.js) so this call is cheap.
export const getExchangeRates = async () => {
  const response = await api.get('/exchange-rates');
  return response.data;
};
