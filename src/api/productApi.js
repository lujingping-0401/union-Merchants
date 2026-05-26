import request from "@/utils/request.js";

/**
 * 商品分页列表
 * @param {Object} params - { pageNum, pageSize, productName, status, categoryId }
 */
export const getProductPage = (params) => {
  return request.get("/merchant/products", { params });
};

/**
 * 商品详情
 * @param {number|string} productId - 商品ID
 */
export const getProductDetail = (productId) => {
  return request.get(`/merchant/products/${productId}`);
};

/**
 * 新增商品
 * @param {Object} data - 商品数据，包含 specs 等
 */
export const addProduct = (data) => {
  return request.post("/merchant/products", data);
};

/**
 * 修改商品基础信息
 * @param {number|string} productId - 商品ID
 * @param {Object} data - 商品更新数据
 */
export const updateProduct = (productId, data) => {
  return request.put(`/merchant/products/${productId}`, data);
};

/**
 * 获取商品分类树
 */
export const getProductCategoryTree = () => {
  return request.get("/merchant/product-categories/tree");
};

/**
 * 强制下架商品
 * @param {number|string} productId - 商品ID
 */
export const delistProduct = (productId) => {
  return request.put(`/merchant/products/${productId}/delist`);
};

/**
 * 获取商品变动记录
 * @param {number|string} productId - 商品ID
 */
export const getProductChangeLogs = (productId) => {
  return request.get(`/merchant/products/${productId}/change-logs`);
};
