import axiosNoAuth from "../axios/axiosNoAuth";
import axiosAuth from "../axios/axiosAuth";

export const fetchOrders = async () => {
  try {
    const response = await axiosNoAuth.get('orders');
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return error.response?.data;
  }
};

export const getOrderById = async (id) => {
  try {
    const response = await axiosNoAuth.get(`orders/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order:", error);
    return error.response?.data;
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await axiosAuth.post('orders', orderData);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    return error.response?.data;
  }
};

export const addProductToOrder = async (productId, quantity = 1) => {
  try {
    const response = await axiosAuth.post(`orders/add-product/${productId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error("Error adding product to order:", error);
    return error.response?.data;
  }
};

export const updateOrder = async (id, orderData) => {
  try {
    const response = await axiosAuth.put(`orders/${id}`, orderData);
    return response.data;
  } catch (error) {
    console.error("Error updating order:", error);
    return error.response?.data;
  }
};

export const deleteOrder = async (id) => {
  try {
    const response = await axiosAuth.delete(`orders/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting order:", error);
    return error.response?.data;
  }
};