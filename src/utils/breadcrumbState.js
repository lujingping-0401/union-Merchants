import { ref } from 'vue'

// Store list of breadcrumbs as an array of { name: string, path: string }
export const breadcrumbs = ref([
  { name: '数据概览', path: '/' }
])

/**
 * Add a route to breadcrumbs if not present.
 */
export const addBreadcrumb = (to) => {
  // Exclude login and merchant-apply pages from the tab navigation
  if (!to || to.path === '/login' || to.path === '/merchant-apply') return

  const path = to.path
  
  // Resolve user-friendly display name
  let name = to.meta?.title || to.name || path
  if (path === '/') {
    name = '数据概览'
  } else if (path === '/product') {
    name = '商品管理'
  }

  // Check if this path is already tracked
  const exists = breadcrumbs.value.some(item => item.path === path)
  if (!exists) {
    breadcrumbs.value.push({ name, path })
  }
}

/**
 * Remove a breadcrumb tab by path.
 * If the current active path is removed, returns the path of the tab to switch to.
 */
export const removeBreadcrumb = (path, currentPath) => {
  // Always keep at least one tab
  if (breadcrumbs.value.length <= 1) return null

  const index = breadcrumbs.value.findIndex(item => item.path === path)
  if (index === -1) return null

  breadcrumbs.value.splice(index, 1)

  // If the removed tab was the active one, navigate to an adjacent tab
  if (path === currentPath) {
    const nextActiveIndex = index < breadcrumbs.value.length ? index : index - 1
    return breadcrumbs.value[nextActiveIndex].path
  }
  return null
}

/**
 * Reset breadcrumbs to default (e.g. on logout)
 */
export const resetBreadcrumbs = () => {
  breadcrumbs.value = [
    { name: '数据概览', path: '/' }
  ]
}
