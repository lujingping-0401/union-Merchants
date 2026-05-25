import request from "@/utils/request.js";

/**
 * 获取商品上架申请分页列表
 * @param {Object} params - { pageNum, pageSize, status }
 */
export const getProductApplyPage = (params) => {
  return request.get("/merchant/product-listing-applies", { params });
};

/**
 * 获取商品上架申请详情
 * @param {number|string} applyId - 申请记录ID
 */
export const getProductApplyDetail = (applyId) => {
  return request.get(`/merchant/product-listing-applies/${applyId}`);
};

/**
 * 新增商品上架申请（草稿）
 * @param {Object} data - { applyName, productIds }
 */
export const createProductApply = (data) => {
  return request.post("/merchant/product-listing-applies", data);
};

/**
 * 提交商品上架审批
 * @param {number|string} applyId - 申请记录ID
 */
export const submitProductApply = (applyId) => {
  return request.put(`/merchant/product-listing-applies/${applyId}/submit`);
};
