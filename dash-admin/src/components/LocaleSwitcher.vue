<script setup lang="ts">
import { computed } from 'vue'
import { Languages } from '@lucide/vue'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { isLocale, locale, LOCALES, setLocale, t } from '@/i18n'

// select: dropdown berlabel; compact: ikon + kode untuk sidebar/nav bawah;
// segmented: tiga tombol sejajar, untuk menu melayang (dropdown ber-portal akan tertutup lapisannya).
withDefaults(defineProps<{ variant?: 'select' | 'compact' | 'segmented' }>(), { variant: 'select' })

const current = computed(() => LOCALES.find((l) => l.code === locale.value) ?? LOCALES[0]!)

function choose(value: unknown) {
  if (isLocale(value)) setLocale(value)
}
</script>

<template>
  <div v-if="variant === 'segmented'" role="group" :aria-label="t('common.language')" class="flex items-center gap-1 rounded-xl bg-muted/60 p-1">
    <Languages class="mx-1.5 h-4 w-4 shrink-0 text-muted-foreground" :stroke-width="1.5" />
    <button
      v-for="l in LOCALES"
      :key="l.code"
      type="button"
      :lang="l.code"
      :title="l.name"
      :aria-pressed="l.code === locale"
      :class="[
        'flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors',
        l.code === locale ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
      ]"
      @click="setLocale(l.code)"
    >
      {{ l.short }}
    </button>
  </div>

  <Select v-else :model-value="locale" @update:model-value="choose">
    <SelectTrigger
      :aria-label="t('common.language')"
      :class="
        variant === 'compact'
          ? 'h-12 w-14 flex-col justify-center gap-0.5 rounded-2xl border-0 bg-transparent px-0 text-[11px] font-semibold text-muted-foreground shadow-none hover:bg-accent hover:text-foreground dark:bg-transparent [&>svg:last-child]:hidden'
          : ''
      "
    >
      <Languages :class="variant === 'compact' ? 'h-5 w-5' : 'h-4 w-4'" :stroke-width="1.5" />
      <span>{{ variant === 'compact' ? current.short : current.name }}</span>
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="l in LOCALES" :key="l.code" :value="l.code" :lang="l.code">{{ l.name }}</SelectItem>
    </SelectContent>
  </Select>
</template>
