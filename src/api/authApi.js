import { axios } from "@/utils/request.js";

/**
 * 获取商家登录验证码
 */
export const getCaptcha = () => {
  return axios("/merchant/auth/captcha", "GET");
};

/**
 * 商家登录
 * @param {Object} data - { username, password, captcha, captchaKey }
 */
export const login = (data) => {
  return axios("/merchant/auth/login", "POST", data);
};

/**
 * 获取当前商家信息
 */
export const getCurrentMerchant = () => {
  return axios("/merchant/auth/current", "GET");
};

