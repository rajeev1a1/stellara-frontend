// Mock implementation of expo-secure-store for testing

export const setItemAsync = jest.fn();
export const getItemAsync = jest.fn();
export const deleteItemAsync = jest.fn();

export default {
  setItemAsync,
  getItemAsync,
  deleteItemAsync,
};