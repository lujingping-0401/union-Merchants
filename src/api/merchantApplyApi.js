import request from "@/utils/request.js";

export const merchantApis = {
  /**
   * 1. 商家上传营业执照
   * @param {File} file - 营业执照文件对象
   */
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return request.post("/merchant/upload-file/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  },

  /**
   * 2. 暂存入驻申请（创建草稿）
   * @param {Object} data - 申请表单数据
   */
  createApply: (data) => {
    return request.post("/merchant/merchant-apply", data);
  },

  /**
   * 3. 更新入驻申请
   * @param {number|string} applyId - 申请记录ID
   * @param {Object} data - 最新表单数据
   */
  updateApply: (applyId, data) => {
    return request.put(`/merchant/merchant-apply/${applyId}`, data);
  },

  /**
   * 4. 查询申请详情
   * @param {number|string} applyId - 申请记录ID
   */
  getDetail: (applyId) => {
    return request.get(`/merchant/merchant-apply/${applyId}`);
  },

  /**
   * 5. 确认并提交审批
   * @param {number|string} applyId - 申请记录ID
   */
  submitApply: (applyId) => {
    return request.put(`/merchant/merchant-apply/${applyId}/submit`);
  }
};
