# Quick Responsive Fix Guide

## Sidebar Toggle - FIXED ✅

Sidebar sekarang menggunakan logic sederhana:
- `isOpen = true` → sidebar visible (translate-x-0)
- `isOpen = false` → sidebar hidden (translate-x-full)

## Responsive Pattern untuk Semua Pages

### 1. Header Section
```vue
<!-- OLD (Desktop only) -->
<div class="flex items-center justify-between">
  <h1 class="font-semibold text-2xl">Title</h1>
  <button>Add New</button>
</div>

<!-- NEW (Responsive) -->
<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
  <h1 class="font-semibold text-xl md:text-2xl">Title</h1>
  <button class="w-full sm:w-auto ...">Add New</button>
</div>
```

### 2. Search & Filter Bar
```vue
<!-- OLD (Desktop only) -->
<form class="flex items-center justify-between">
  <div class="flex flex-col gap-3 w-[370px]">
    <input class="w-full h-14 ..." />
  </div>
  <div class="flex items-center gap-4">
    <select class="h-14 ..."></select>
    <button class="h-14 ...">Filter</button>
  </div>
</form>

<!-- NEW (Responsive) -->
<form class="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
  <div class="flex-1 max-w-full lg:max-w-[370px]">
    <input class="w-full h-12 md:h-14 text-sm md:text-base ..." />
  </div>
  <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
    <div class="flex items-center gap-2">
      <span class="text-sm md:text-base whitespace-nowrap">Show</span>
      <select class="h-12 md:h-14 text-sm md:text-base ..."></select>
    </div>
    <button class="w-full sm:w-auto h-12 md:h-14 ...">Filter</button>
  </div>
</form>
```

### 3. Table Wrapper (Horizontal Scroll)
```vue
<!-- Wrap tables with horizontal scroll for mobile -->
<div class="overflow-x-auto -mx-4 md:mx-0">
  <div class="inline-block min-w-full align-middle px-4 md:px-0">
    <table class="min-w-full">
      <!-- Table content -->
    </table>
  </div>
</div>
```

### 4. Cards Grid
```vue
<!-- Responsive grid for cards -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
  <div class="card">...</div>
</div>
```

### 5. Form Fields
```vue
<!-- 1 column mobile, 2 columns desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
  <div class="form-group">
    <label class="text-sm md:text-base ...">Label</label>
    <input class="h-11 md:h-12 text-sm md:text-base ..." />
  </div>
</div>
```

### 6. Stats Cards
```vue
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
  <div class="stat-card p-4 md:p-6">
    <h3 class="text-sm md:text-base">Label</h3>
    <p class="text-2xl md:text-3xl">Value</p>
  </div>
</div>
```

## Common Responsive Classes

### Text Sizes
- Small: `text-xs md:text-sm`
- Base: `text-sm md:text-base`
- Large: `text-base md:text-lg`
- Heading 3: `text-lg md:text-xl`
- Heading 2: `text-xl md:text-2xl`
- Heading 1: `text-2xl md:text-3xl lg:text-4xl`

### Spacing
- Padding: `p-4 md:p-6`
- Gap: `gap-3 md:gap-4`
- Margin: `m-4 md:m-6`

### Sizing
- Input Height: `h-11 md:h-12 lg:h-14`
- Button Height: `h-11 md:h-12`
- Icon Size: `size-5 md:size-6`

### Layout
- Flex Direction: `flex-col md:flex-row`
- Grid Columns: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Width: `w-full md:w-auto`
- Max Width: `max-w-full md:max-w-xl`

### Show/Hide
- Hide on mobile: `hidden md:flex`
- Show on mobile: `flex md:hidden`
- Hide on desktop: `flex lg:hidden`

## Priority Pages to Update

1. ✅ Dashboard.vue
2. ✅ HeadOfFamilies.vue  
3. ✅ SocialAssistances.vue
4. ✅ SocialAssistanceRecipients.vue
5. ✅ JobVacancies.vue
6. ✅ Events.vue
7. ✅ FamilyMembers.vue
8. ✅ Profile.vue

## Testing Checklist

### Mobile (< 768px)
- [ ] Hamburger menu works
- [ ] Sidebar slides in from left
- [ ] Forms are 1 column
- [ ] Buttons are full width
- [ ] Tables scroll horizontally
- [ ] Text is readable (min 14px)
- [ ] Touch targets are 44x44px minimum

### Tablet (768px - 1023px)
- [ ] Layout 2 columns
- [ ] Sidebar toggles
- [ ] Text comfortable size

### Desktop (>= 1024px)
- [ ] Sidebar open by default
- [ ] Full multi-column layout
- [ ] Optimal spacing

