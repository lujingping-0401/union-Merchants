import request from "@/utils/request.js";

/**
 * 获取商家登录验证码
 */
export const getCaptcha = () => {
  return request.get("/merchant/auth/captcha");
};

/**
 * 商家登录
 * @param {Object} data - { username, password, captcha, captchaKey }
 */
export const login = (data) => {
  return request.post("/merchant/auth/login", data);
};

/**
 * 获取当前商家信息
 */
export const getCurrentMerchant = () => {
  return request.get("/merchant/auth/current");
};
