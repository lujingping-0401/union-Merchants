import { axios } from "@/utils/request.js";

/**
 * 商品分页列表
 * @param {Object} params - { pageNum, pageSize, productName, status, categoryId }
 */
export const getProductPage = (params) => {
  return axios("/merchant/products", "GET", params);
};

/**
 * 商品详情
 * @param {number|string} productId - 商品ID
 */
export const getProductDetail = (productId) => {
  return axios(`/merchant/products/${productId}`, "GET");
};

/**
 * 新增商品
 * @param {Object} data - 商品数据，包含 specs 等
 */
export const addProduct = (data) => {
  return axios("/merchant/products", "POST", data);
};

/**
 * 修改商品基础信息
 * @param {number|string} productId - 商品ID
 * @param {Object} data - 商品更新数据
 */
export const updateProduct = (productId, data) => {
  return axios(`/merchant/products/${productId}`, "PUT", data);
};

/**
 * 获取商品分类树
 */
export const getProductCategoryTree = () => {
  return axios("/merchant/product-categories/tree", "GET");
};

