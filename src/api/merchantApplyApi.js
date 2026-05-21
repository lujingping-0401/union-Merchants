import { baseUrl } from "@/utils/baseUrl.js";

const BASEURL = baseUrl();

/**
 * 统一的商家入驻微服务请求辅助函数
 */
async function merchantRequest(url, method = "GET", body = null, isUpload = false) {
  const headers = {};
  
  // 注入 Token（兼容后端安全审计）
  const token = localStorage.getItem("union-admin-token") || localStorage.getItem("token");
  
  if (token === 'mock-token') {
    if (url === '/merchant/upload-file/upload' && method.toUpperCase() === 'POST') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            code: 200,
            msg: 'success',
            data: {
              filePath: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&auto=format&fit=crop&q=80'
            }
          });
        }, 300);
      });
    }
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method: method.toUpperCase(),
    headers,
  };

  if (body) {
    if (isUpload) {
      // 文件上传时，由浏览器自动填充 Content-Type 及 boundary 边界，Fetch 请求不能手动设置 Content-Type
      options.body = body;
    } else {
      headers["Content-Type"] = "application/json;charset=UTF-8";
      options.body = JSON.stringify(body);
    }
  }

  const response = await fetch(`${BASEURL}${url}`, options);
  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = responseData?.message || responseData?.msg || `请求失败，状态码: ${response.status}`;
    throw new Error(errorMsg);
  }

  return responseData;
}

export const merchantApis = {
  /**
   * 1. 商家上传营业执照
   * @param {File} file - 营业执照文件对象
   */
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return merchantRequest("/merchant/upload-file/upload", "POST", formData, true);
  },

  /**
   * 2. 暂存入驻申请（创建草稿）
   * @param {Object} data - 申请表单数据
   */
  createApply: (data) => {
    return merchantRequest("/merchant/merchant-apply", "POST", data);
  },

  /**
   * 3. 更新入驻申请
   * @param {number|string} applyId - 申请记录ID
   * @param {Object} data - 最新表单数据
   */
  updateApply: (applyId, data) => {
    return merchantRequest(`/merchant/merchant-apply/${applyId}`, "PUT", data);
  },

  /**
   * 4. 查询申请详情
   * @param {number|string} applyId - 申请记录ID
   */
  getDetail: (applyId) => {
    return merchantRequest(`/merchant/merchant-apply/${applyId}`, "GET");
  },

  /**
   * 5. 确认并提交审批
   * @param {number|string} applyId - 申请记录ID
   */
  submitApply: (applyId) => {
    return merchantRequest(`/merchant/merchant-apply/${applyId}/submit`, "PUT");
  }
};
