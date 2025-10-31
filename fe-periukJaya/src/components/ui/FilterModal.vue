<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  filters: {
    type: Object,
    required: true,
  },
  filterConfig: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue', 'apply', 'reset']);

const localFilters = ref({ ...props.filters });

watch(
  () => props.filters,
  (newFilters) => {
    localFilters.value = { ...newFilters };
  },
  { deep: true }
);

const closeModal = () => {
  emit('update:modelValue', false);
};

const applyFilters = () => {
  emit('apply', localFilters.value);
  closeModal();
};

const resetFilters = () => {
  const resetValues = {};
  props.filterConfig.forEach((config) => {
    resetValues[config.key] = config.type === 'range' ? { min: null, max: null } : null;
  });
  localFilters.value = resetValues;
  emit('reset', resetValues);
  closeModal();
};

const getFilterComponent = (filterType) => {
  switch (filterType) {
    case 'select':
    case 'radio':
    case 'date':
    case 'range':
      return filterType;
    default:
      return 'text';
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        @click.self="closeModal"
      >
        <div
          class="bg-white rounded-3xl shadow-xl w-full max-w-[680px] max-h-[85vh] overflow-hidden flex flex-col"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-4 md:px-6 py-4 md:py-5 border-b border-desa-background"
          >
            <h2 class="text-lg md:text-xl font-semibold text-desa-black">Filter</h2>
            <button
              type="button"
              @click="closeModal"
              class="flex items-center justify-center size-9 rounded-full hover:bg-desa-background transition-colors"
            >
              <img
                src="@/assets/images/icons/close-circle-white.svg"
                class="size-6"
                alt="close"
              />
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
            <!-- Grid: 1 kolom di mobile, 2 kolom di desktop -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-6">
              <!-- Dynamic Filter Fields -->
              <div
                v-for="config in filterConfig"
                :key="config.key"
                class="flex flex-col gap-2.5"
              >
                <label class="font-medium text-desa-black">
                  {{ config.label }}
                </label>

                <!-- Select Type -->
                <div v-if="config.type === 'select'" class="relative">
                  <select
                    v-model="localFilters[config.key]"
                      class="appearance-none outline-none w-full h-12 rounded-2xl ring-[1.5px] ring-desa-background focus:ring-desa-black py-3 px-4 pr-11 transition-all duration-300"
                  >
                    <option :value="null">Semua {{ config.label }}</option>
                    <option
                      v-for="option in config.options"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                  <img
                    src="@/assets/images/icons/arrow-down-black.svg"
                    class="size-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    alt="arrow"
                  />
                </div>

                <!-- Radio Type -->
                <div
                  v-else-if="config.type === 'radio'"
                  class="flex flex-col gap-2.5"
                >
                  <label
                    v-for="option in config.options"
                    :key="option.value"
                    class="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      :name="config.key"
                      :value="option.value"
                      v-model="localFilters[config.key]"
                      class="size-4 accent-desa-dark-green"
                    />
                    <span class="text-desa-black">{{
                      option.label
                    }}</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      :name="config.key"
                      :value="null"
                      v-model="localFilters[config.key]"
                      class="size-4 accent-desa-dark-green"
                    />
                    <span class="text-desa-black">Semua</span>
                  </label>
                </div>

                <!-- Date Type -->
                <div v-else-if="config.type === 'date'" class="relative">
                  <input
                    type="date"
                    v-model="localFilters[config.key]"
                    class="appearance-none outline-none w-full h-12 rounded-2xl ring-[1.5px] ring-desa-background focus:ring-desa-black py-3 px-4 transition-all duration-300"
                  />
                </div>

                <!-- Range Type (for salary, price, etc) -->
                <div
                  v-else-if="config.type === 'range'"
                  class="flex items-center gap-3"
                >
                  <div class="flex-1">
                    <input
                      type="number"
                      v-model="localFilters[config.key].min"
                      :placeholder="`Min`"
                      class="appearance-none outline-none w-full h-12 rounded-2xl ring-[1.5px] ring-desa-background focus:ring-desa-black py-3 px-4 transition-all duration-300"
                    />
                  </div>
                  <span class="text-desa-secondary">-</span>
                  <div class="flex-1">
                    <input
                      type="number"
                      v-model="localFilters[config.key].max"
                      :placeholder="`Max`"
                      class="appearance-none outline-none w-full h-12 rounded-2xl ring-[1.5px] ring-desa-background focus:ring-desa-black py-3 px-4 transition-all duration-300"
                    />
                  </div>
                </div>

                <!-- Text Type (default) -->
                <input
                  v-else
                  type="text"
                  v-model="localFilters[config.key]"
                  :placeholder="config.placeholder || `Masukkan ${config.label}`"
                  class="appearance-none outline-none w-full h-12 rounded-2xl ring-[1.5px] ring-desa-background focus:ring-desa-black py-3 px-4 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="flex flex-col sm:flex-row items-center gap-3 md:gap-4 px-4 md:px-6 py-4 md:py-5 border-t border-desa-background"
          >
            <button
              type="button"
              @click="resetFilters"
              class="w-full sm:flex-1 h-12 rounded-2xl border-2 border-desa-dark-green text-desa-dark-green font-medium hover:border-desa-dark-green hover:bg-desa-dark-green/5 transition-all duration-300"
            >
              Reset
            </button>
            <button
              type="button"
              @click="applyFilters"
              class="w-full sm:flex-1 h-12 rounded-2xl bg-desa-dark-green text-white font-medium hover:bg-opacity-90 transition-all duration-300"
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.9);
}
</style>

