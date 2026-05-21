/**
 * 
 * @param {*} url 
 * @param {*} method 
 * @param {*} data 
 * @param {*} headers
 * @param {*} options { skipAuthRedirect: boolean, hideToast: boolean } 是否跳过认证重定向, 是否隐藏错误提示
 * @returns 返回一个promise
 */
import {
	baseUrl
} from './baseUrl.js';
import {
	getToken,
	setToken
} from './token.js';
import { ElMessage } from 'element-plus';
import router from '@/router';

const BASEURL = baseUrl();
const REQUEST_TIMEOUT = 5000;

console.log(BASEURL, 'BASEURL');

function getMockProducts() {
	let products = localStorage.getItem('mock_products');
	if (!products) {
		products = [
			{
				id: 1,
				productName: "iPhone 15 Pro",
				coverUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80",
				carouselUrls: [
					"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80",
					"https://images.unsplash.com/photo-1496181130204-7552cc1524e2?w=500&auto=format&fit=crop&q=80"
				],
				categoryName: "数码电子",
				categoryId: 2,
				totalStock: 150,
				deliveryPlace: "广东深圳",
				description: "iPhone 15 Pro 采用航空级钛金属设计，搭载 A17 Pro 芯片，配备可自定义的操作按钮，以及强大的 Pro 相机系统。",
				status: 1,
				specs: [
					{ specName: "128G 黑色", imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&auto=format&fit=crop&q=80", price: 7999.00, stock: 100, sort: 1 },
					{ specName: "256G 钛金", imageUrl: "https://images.unsplash.com/photo-1496181130204-7552cc1524e2?w=100&auto=format&fit=crop&q=80", price: 8999.00, stock: 50, sort: 2 }
				],
				createTime: "2026-05-21T06:00:00.000Z",
				updateTime: "2026-05-21T06:10:00.000Z"
			},
			{
				id: 2,
				productName: "意式极简全棉手账本",
				coverUrl: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300&auto=format&fit=crop&q=80",
				carouselUrls: [
					"https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&auto=format&fit=crop&q=80"
				],
				categoryName: "办公文具",
				categoryId: 1,
				totalStock: 8,
				deliveryPlace: "浙江杭州",
				description: "纯棉封面，意式手工线装订。采用 100g 进口巴川纸，书写流畅不洇墨，是您工作记录与手账创作的完美伴侣。",
				status: 0,
				specs: [
					{ specName: "A5 经典款-孔雀蓝", imageUrl: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=100&auto=format&fit=crop&q=80", price: 48.00, stock: 8, sort: 1 }
				],
				createTime: "2026-05-21T05:00:00.000Z",
				updateTime: "2026-05-21T05:30:00.000Z"
			},
			{
				id: 3,
				productName: "有机高山绿茶 250g",
				coverUrl: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=300&auto=format&fit=crop&q=80",
				carouselUrls: [
					"https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&auto=format&fit=crop&q=80"
				],
				categoryName: "食品生鲜",
				categoryId: 3,
				totalStock: 300,
				deliveryPlace: "福建武夷山",
				description: "采自海拔1200米高山茶园，手工采摘一芽一叶，传统工艺精心炒制。茶汤清澈明亮，口感甘醇回甘，兰香持久。",
				status: 2,
				specs: [
					{ specName: "特级散装 250g", imageUrl: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=100&auto=format&fit=crop&q=80", price: 128.00, stock: 300, sort: 1 }
				],
				createTime: "2026-05-21T04:00:00.000Z",
				updateTime: "2026-05-21T04:30:00.000Z"
			}
		];
		localStorage.setItem('mock_products', JSON.stringify(products));
	} else {
		products = JSON.parse(products);
	}
	return products;
}

function saveMockProducts(products) {
	localStorage.setItem('mock_products', JSON.stringify(products));
}

export function axios(url, method = 'GET', data = {}, headers = {}, options = {}) {
	// 合并默认headers和传入的headers  
	const defaultHeaders = {
		'Content-Type': 'application/json',
	};
	headers = Object.assign({}, defaultHeaders, headers);

	const token = getToken();
	
	// Mock Interception
	if (token === 'mock-token') {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const products = getMockProducts();
				
				// 1. GET /merchant/products (List)
				if (url === '/merchant/products' && method.toUpperCase() === 'GET') {
					let filtered = [...products];
					if (data.productName) {
						filtered = filtered.filter(p => p.productName.includes(data.productName));
					}
					if (data.categoryId) {
						filtered = filtered.filter(p => p.categoryId == data.categoryId);
					}
					if (data.status !== undefined && data.status !== null && data.status !== '') {
						filtered = filtered.filter(p => p.status == data.status);
					}
					
					const pageNum = parseInt(data.pageNum) || 1;
					const pageSize = parseInt(data.pageSize) || 10;
					const start = (pageNum - 1) * pageSize;
					const end = start + pageSize;
					
					resolve({
						code: 200,
						msg: 'success',
						data: {
							records: filtered.slice(start, end),
							total: filtered.length,
							size: pageSize,
							current: pageNum
						}
					});
					return;
				}
				
				// 2. GET /merchant/products/:id (Detail)
				const detailMatch = url.match(/^\/merchant\/products\/(\d+)$/);
				if (detailMatch && method.toUpperCase() === 'GET') {
					const id = parseInt(detailMatch[1]);
					const prod = products.find(p => p.id === id);
					if (prod) {
						resolve({
							code: 200,
							msg: 'success',
							data: JSON.parse(JSON.stringify(prod))
						});
					} else {
						resolve({
							code: 404,
							msg: '商品不存在'
						});
					}
					return;
				}
				
				// 3. POST /merchant/products (Create)
				if (url === '/merchant/products' && method.toUpperCase() === 'POST') {
					const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
					const newProd = {
						id: newId,
						productName: data.productName,
						coverUrl: data.coverUrl,
						carouselUrls: data.carouselUrls || [],
						description: data.description,
						deliveryPlace: data.deliveryPlace,
						categoryId: data.categoryId,
						categoryName: data.categoryName,
						status: data.status !== undefined ? data.status : 1,
						specs: data.specs || [],
						totalStock: (data.specs || []).reduce((sum, s) => sum + (parseInt(s.stock) || 0), 0),
						createTime: new Date().toISOString(),
						updateTime: new Date().toISOString()
					};
					products.unshift(newProd);
					saveMockProducts(products);
					resolve({
						code: 200,
						msg: 'success',
						data: newProd
					});
					return;
				}
				
				// 4. PUT /merchant/products/:id (Update)
				const updateMatch = url.match(/^\/merchant\/products\/(\d+)$/);
				if (updateMatch && method.toUpperCase() === 'PUT') {
					const id = parseInt(updateMatch[1]);
					const index = products.findIndex(p => p.id === id);
					if (index !== -1) {
						products[index] = {
							...products[index],
							productName: data.productName,
							coverUrl: data.coverUrl,
							carouselUrls: data.carouselUrls || [],
							description: data.description,
							deliveryPlace: data.deliveryPlace,
							categoryId: data.categoryId,
							categoryName: data.categoryName,
							status: data.status !== undefined ? data.status : products[index].status,
							specs: data.specs || [],
							totalStock: (data.specs || []).reduce((sum, s) => sum + (parseInt(s.stock) || 0), 0),
							updateTime: new Date().toISOString()
						};
						saveMockProducts(products);
						resolve({
							code: 200,
							msg: 'success',
							data: products[index]
						});
					} else {
						resolve({
							code: 404,
							msg: '商品不存在'
						});
					}
					return;
				}
				
				// 5. GET /merchant/auth/current
				if (url === '/merchant/auth/current' && method.toUpperCase() === 'GET') {
					resolve({
						code: 200,
						message: 'success',
						data: {
							merchantId: 10001,
							loginName: 'geek_select',
							companyName: '极客智选商贸有限公司',
							legalPersonName: '张三',
							legalPersonPhone: '13800138000',
							accountContactPhone: '13800138000',
							businessAddress: '北京市朝阳区科技路10号',
							returnAddress: '北京市朝阳区科技路10号',
							businessLicenseUrl: '',
							email: 'contact@geekselect.com',
							status: 1
						},
						timestamp: Date.now()
					});
					return;
				}

				// 6. GET /merchant/product-categories/tree
				if (url === '/merchant/product-categories/tree' && method.toUpperCase() === 'GET') {
					resolve({
						code: 0,
						message: 'success',
						data: [
							{
								id: 1,
								parentId: 0,
								categoryName: "办公文具",
								sort: 1,
								children: []
							},
							{
								id: 2,
								parentId: 0,
								categoryName: "数码电子",
								sort: 2,
								children: [
									{
										id: 4,
										parentId: 2,
										categoryName: "手机",
										sort: 1,
										children: []
									},
									{
										id: 5,
										parentId: 2,
										categoryName: "电脑",
										sort: 2,
										children: []
									}
								]
							},
							{
								id: 3,
								parentId: 0,
								categoryName: "食品生鲜",
								sort: 3,
								children: []
							}
						],
						timestamp: Date.now()
					});
					return;
				}
				
				reject(new Error('Unknown mock request: ' + url));
			}, 300);
		});
	}
	// 如果存在token，则添加到headers中  
	if (token) {
		headers['token'] = `${token}`;
		headers['Authorization'] = 'Bearer ' + token;
	}

	let requestUrl = url.includes('http://') || url.includes('https://') ? url : `${BASEURL}${url}`;
	const fetchOptions = {
		method: method.toUpperCase(),
		headers: headers,
	};

	if (fetchOptions.method === 'GET') {
		const queryParams = new URLSearchParams();
		Object.keys(data).forEach(key => {
			if (data[key] !== undefined && data[key] !== null) {
				queryParams.append(key, data[key]);
			}
		});
		const queryString = queryParams.toString();
		if (queryString) {
			requestUrl += (requestUrl.includes('?') ? '&' : '?') + queryString;
		}
	} else {
		fetchOptions.body = JSON.stringify(data);
	}

	// 设置超时
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
	fetchOptions.signal = controller.signal;

	return fetch(requestUrl, fetchOptions)
		.then(async (response) => {
			clearTimeout(timeoutId);
			const statusCode = response.status;
			let responseData;
			try {
				responseData = await response.json();
			} catch (e) {
				responseData = null;
			}

			if (statusCode === 200 && responseData && (responseData.code === 200 || responseData.code === 0)) {
				return responseData;
			} else if (
				(responseData && (responseData.code === 401 || responseData.code === 403)) || 
				statusCode === 401 || 
				statusCode === 403
			) {
				// 根据options决定是否自动跳转
				if (!options.skipAuthRedirect) {
					ElMessage({
						message: (responseData && (responseData.msg || responseData.message)) ? (responseData.msg || responseData.message) : '登录已失效，请重新登录',
						type: 'error',
						duration: 3000
					});
					setTimeout(() => {
						router.push('/login');
						localStorage.clear();
					}, 2000);
				}
				throw new Error('AUTH_ERROR');
			} else {
				if (responseData && responseData.code !== 200 && responseData.code !== 0) {
					if (!options.hideToast) {
						ElMessage({
							message: responseData.msg || responseData.message || '请求出错',
							type: 'error',
							duration: 3000
						});
					}
				}
				return responseData;
			}
		})
		.catch((error) => {
			clearTimeout(timeoutId);
			if (error.name === 'AbortError') {
				ElMessage({
					message: '请求超时，请稍后再试',
					type: 'error'
				});
				throw new Error('TIMEOUT');
			}
			
			if (error.message === 'AUTH_ERROR' || error.message === 'TIMEOUT') {
				throw error;
			}

			ElMessage({
				message: '网络请求失败',
				type: 'error'
			});
			throw error;
		});
}
