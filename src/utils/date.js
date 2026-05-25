/**
 * 格式化日期时间
 * @param {Date|string|number} dateVal - 需要格式化的日期值（Date对象、时间戳或日期字符串）
 * @param {string} pattern - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的字符串，若值无效或解析失败则返回原值或 '-'
 */
export function formatDate(dateVal, pattern = 'YYYY-MM-DD HH:mm:ss') {
  if (!dateVal) return '-';
  
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const r = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    
    return pattern
      .replace('YYYY', y)
      .replace('MM', m)
      .replace('DD', r)
      .replace('HH', hh)
      .replace('mm', mm)
      .replace('ss', ss);
  } catch (e) {
    return String(dateVal);
  }
}
