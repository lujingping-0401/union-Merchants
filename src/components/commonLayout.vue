<template>
  <div class="common-layout">
    <section v-if="$slots.search" class="common-layout__search">
      <slot name="search"></slot>
    </section>

    <section class="common-layout__table-section">
      <div v-if="$slots.actions" class="common-layout__actions">
        <slot name="actions"></slot>
      </div>

      <div class="common-layout__table">
        <slot name="table"></slot>
      </div>
    </section>

    <section v-if="$slots.pagination" class="common-layout__pagination">
      <slot name="pagination"></slot>
    </section>
  </div>
</template>

<style scoped>
.common-layout {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.common-layout__search,
.common-layout__actions,
.common-layout__pagination {
  flex: 0 0 auto;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.common-layout__table-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.common-layout__table {
  flex: 1;
  min-height: 0;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  overflow: auto;
}

@media (max-width: 768px) {
  .common-layout {
    gap: 12px;
  }

  .common-layout__search,
  .common-layout__actions,
  .common-layout__table,
  .common-layout__pagination {
    padding: 12px;
    border-radius: 14px;
  }
}
</style>
