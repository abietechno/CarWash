<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { ImagePlus, X } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { t } from '@/i18n'

// Pilih foto (jpg/png/webp, maks 3 MB). File diunggah oleh parent setelah data utama tersimpan.
const props = defineProps<{ currentUrl: string | null }>()
const file = defineModel<File | null>('file', { required: true })
const removed = defineModel<boolean>('removed', { required: true })

const input = ref<HTMLInputElement | null>(null)
const error = ref('')
const objectUrl = ref<string | null>(null)

watch(file, (f) => {
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
  objectUrl.value = f ? URL.createObjectURL(f) : null
})
onUnmounted(() => objectUrl.value && URL.revokeObjectURL(objectUrl.value))

const preview = computed(() => objectUrl.value ?? (removed.value ? null : props.currentUrl))

function pick(event: Event) {
  const selected = (event.target as HTMLInputElement).files?.[0]
  error.value = ''
  if (!selected) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) {
    error.value = t('image.badFormat')
  } else if (selected.size > 3 * 1024 * 1024) {
    error.value = t('image.tooLarge')
  } else {
    file.value = selected
    removed.value = false
  }
  if (input.value) input.value.value = ''
}

function clear() {
  file.value = null
  removed.value = true
}
</script>

<template>
  <div class="space-y-2">
    <div v-if="preview" class="relative overflow-hidden rounded-xl border border-border/60">
      <img :src="preview" alt="" class="aspect-[16/9] w-full object-cover" />
      <Button type="button" variant="secondary" size="icon-sm" class="absolute top-2 right-2" :aria-label="t('image.remove')" @click="clear">
        <X />
      </Button>
    </div>
    <Button type="button" variant="outline" size="sm" @click="input?.click()">
      <ImagePlus /> {{ preview ? t('image.change') : t('image.pick') }}
    </Button>
    <input ref="input" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="pick" />
    <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
  </div>
</template>
