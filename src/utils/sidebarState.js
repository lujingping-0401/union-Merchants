import { ref } from 'vue'

export const isCollapse = ref(false)

export const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
