<template>
  <v-container fluid class="pa-0">
    <v-card elevation="0" class="pa-4">
      <v-card-title class="text-h5 text-primary mb-4 px-0">AAS Creator</v-card-title>
      <v-card-text class="px-0">
        <p class="mb-4 text-subtitleText">
          Upload a SCHUNK IDTA-template XLSX file to generate an AASX package.
        </p>

        <v-file-input
          v-model="xlsxFile"
          label="Select XLSX File"
          accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          prepend-icon="mdi-file-excel"
          variant="outlined"
          color="primary"
          :rules="[(v: unknown) => !!v || 'File is required']"
          :disabled="isProcessing"
        />

        <v-progress-linear v-if="isProcessing" indeterminate color="primary" class="my-4" />
      </v-card-text>

      <v-card-actions class="px-0" v-if="!isProcessing">
        <v-btn color="primary" variant="outlined" :disabled="!xlsxFile" @click="generateAndDownload">
          <v-icon start>mdi-download</v-icon>
          Download .aasx
        </v-btn>

        <!-- Only rendered when the token carries the admin role -->
        <v-btn
          v-if="isAdmin"
          color="primary"
          variant="flat"
          class="ml-3"
          :disabled="!xlsxFile"
          @click="generateAndPushToServer"
        >
          <v-icon start>mdi-cloud-upload</v-icon>
          Push to BaSyx
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="5000">
      {{ snackbar.text }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useInfrastructureStore } from '@/store/InfrastructureStore'

  // ── Config ────────────────────────────────────────────────────────────────
  // Creator service base URL. Configure at image build time:
  //   docker build --build-arg VITE_AAS_CREATOR_URL=https://<creator-url> ...
  // Falls back to the local dev service.
  const API_BASE = ((import.meta.env.VITE_AAS_CREATOR_URL as string) || 'http://localhost:8085')
    .replace(/\/+$/, '')

  // ── State ─────────────────────────────────────────────────────────────────
  const xlsxFile = ref<File | File[] | null>(null)
  const isProcessing = ref(false)
  const isAdmin = ref(false)
  const snackbar = ref({ show: false, text: '', color: 'success' })

  // ── Auth: reuse the Keycloak token the UI already holds ─────────────────
  const infrastructureStore = useInfrastructureStore()
  const accessToken = computed<string | null>(
    () => infrastructureStore.getSelectedInfrastructure?.token?.accessToken ?? null,
  )

  function authHeaders (): Record<string, string> {
    return accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {}
  }

  // ── Role check on mount → decides whether the Push button exists ────────
  onMounted(async () => {
    try {
      const r = await fetch(`${API_BASE}/api/me`, { headers: authHeaders() })
      if (r.ok) {
        isAdmin.value = (await r.json()).is_admin === true
      }
    } catch {
      isAdmin.value = false
    }
  })

  // ── Helpers ───────────────────────────────────────────────────────────────
  function getFileToUpload (): File | null {
    if (!xlsxFile.value) return null
    return Array.isArray(xlsxFile.value) ? (xlsxFile.value[0] ?? null) : xlsxFile.value
  }

  async function errorDetail (response: Response): Promise<string> {
    const body = await response.json().catch(() => null) as { detail?: string } | null
    return body?.detail || `Server error: ${response.status}`
  }

  function showSnackbar (text: string, color: string): void {
    snackbar.value = { show: true, text, color }
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  async function generateAndDownload (): Promise<void> {
    const file = getFileToUpload()
    if (!file) return
    isProcessing.value = true
    const formData = new FormData()
    formData.append('file', file)
    try {
      const r = await fetch(`${API_BASE}/api/convert/download`, {
        method: 'POST', body: formData, headers: authHeaders(),
      })
      if (!r.ok) throw new Error(await errorDetail(r))

      // Prefer the server's sanitized filename (requires CORS expose_headers
      // on the creator service; falls back to the local name otherwise)
      const disposition = r.headers.get('Content-Disposition') || ''
      const match = disposition.match(/filename="([^"]+)"/)
      const filename = match?.[1] || file.name.replace(/\.xlsx$/i, '.aasx')

      const blob = await r.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
      showSnackbar('AASX downloaded successfully!', 'success')
    } catch (error) {
      showSnackbar(error instanceof Error ? error.message : 'Download failed', 'error')
    } finally {
      isProcessing.value = false
    }
  }

  async function generateAndPushToServer (): Promise<void> {
    const file = getFileToUpload()
    if (!file) return
    isProcessing.value = true
    const formData = new FormData()
    formData.append('file', file)
    try {
      const r = await fetch(`${API_BASE}/api/convert/upload`, {
        method: 'POST', body: formData, headers: authHeaders(),
      })
      if (r.status === 403) throw new Error('Your account is not allowed to publish to the server')
      if (!r.ok) throw new Error(await errorDetail(r))
      const result = await r.json() as { asset_name?: string }
      showSnackbar(`'${result.asset_name ?? 'AAS'}' published to BaSyx!`, 'success')
    } catch (error) {
      showSnackbar(error instanceof Error ? error.message : 'Push to BaSyx failed', 'error')
    } finally {
      isProcessing.value = false
    }
  }
</script>