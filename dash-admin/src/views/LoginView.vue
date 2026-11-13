<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LoaderCircle } from '@lucide/vue'
import LocaleSwitcher from '@/components/LocaleSwitcher.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { locale, t } from '@/i18n'
import { errorMessage, fieldErrors } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const landingUrl = import.meta.env.VITE_LANDING_URL || 'http://carwash.localhost:8000'
// Landing page: Indonesia di "/", bahasa lain di "/ms" dan "/en".
const signupUrl = computed(() => `${landingUrl}/${locale.value === 'id' ? '' : locale.value}#daftar`)

const email = ref(typeof route.query.email === 'string' ? route.query.email : '')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.replace(redirect.startsWith('/') ? redirect : '/')
  } catch (e) {
    error.value = fieldErrors(e).email?.[0] ?? errorMessage(e, t('login.failed'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="flex min-h-svh items-center justify-center bg-background p-4">
    <div class="w-full max-w-sm">
      <div class="mb-8 flex flex-col items-center text-center">
        <img src="/logo.png" alt="" class="h-14 w-auto" />
        <p class="mt-2 font-display text-xl font-bold">WashWuzz</p>
        <h1 class="mt-5 text-2xl font-bold">{{ t('login.title') }}</h1>
        <p class="mt-1 text-sm text-muted-foreground">{{ t('login.subtitle') }}</p>
      </div>

      <form class="space-y-4 rounded-2xl border border-border/60 bg-card p-6" @submit.prevent="submit">
        <div class="space-y-2">
          <Label for="email">{{ t('login.email') }}</Label>
          <Input id="email" v-model="email" type="email" autocomplete="email" required autofocus />
        </div>
        <div class="space-y-2">
          <Label for="password">{{ t('login.password') }}</Label>
          <Input id="password" v-model="password" type="password" autocomplete="current-password" required />
        </div>
        <p v-if="error" class="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{{ error }}</p>
        <Button type="submit" class="h-10 w-full" :disabled="loading">
          <LoaderCircle v-if="loading" class="animate-spin" />
          {{ t('login.submit') }}
        </Button>
      </form>

      <p class="mt-6 text-center text-sm text-muted-foreground">
        {{ t('login.noAccount') }}
        <a :href="signupUrl" class="font-medium text-foreground underline-offset-4 hover:underline">{{ t('login.signup') }}</a>
      </p>

      <LocaleSwitcher variant="segmented" class="mx-auto mt-6 w-56" />
    </div>
  </main>
</template>
