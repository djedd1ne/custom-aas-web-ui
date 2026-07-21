=<template>
  <v-container fluid class="pa-0">
    <v-card elevation="0" class="pa-4">
      <v-card-title class="text-h5 text-primary mb-4 px-0">AAS Creator</v-card-title>
      <v-card-text class="px-0">
        <p class="mb-4 text-subtitleText">Upload an XLSX mapping file to generate an AASX package.</p>
        
        <v-file-input
          v-model="xlsxFile"
          label="Select XLSX File"
          accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          prepend-icon="mdi-file-excel"
          variant="outlined"
          color="primary"
          :rules="[v => !!v || 'File is required']"
          :disabled="isProcessing"
        ></v-file-input>

        <v-progress-linear
          v-if="isProcessing"
          indeterminate
          color="primary"
          class="my-4"
        ></v-progress-linear>
      </v-card-text>

      <v-card-actions class="px-0" v-if="!isProcessing">
        <!-- Download Locally -->
        <v-btn 
          color="primary" 
          variant="outlined" 
          @click="generateAndDownload"
          :disabled="!xlsxFile"
        >
          <v-icon start>mdi-download</v-icon>
          Download .aasx
        </v-btn>
        
        <!-- Upload to Server -->
        <v-btn 
          color="primary" 
          variant="flat" 
          @click="generateAndPushToServer"
          :disabled="!xlsxFile"
          class="ml-3"
        >
          <v-icon start>mdi-cloud-upload</v-icon>
          Push to BaSyx
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Success/Error Feedback -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000">
      {{ snackbar.text }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const xlsxFile = ref<File | File[] | null>(null)
const isProcessing = ref(false)
const snackbar = ref({ show: false, text: '', color: 'success' })

// Replace with your Cloud Run URL once deployed
const API_ENDPOINT = 'http://localhost:8000/api/v1/generate-aasx'

// Helper to handle Vuetify's v-model returning a single File or an Array
const getFileToUpload = (): File | null => {
  if (!xlsxFile.value) return null
  return Array.isArray(xlsxFile.value) ? xlsxFile.value[0] : xlsxFile.value
}

const generateAndDownload = async () => {
  const file = getFileToUpload()
  if (!file) return

  isProcessing.value = true
  const formData = new FormData()
  formData.append('file', file)
  formData.append('action', 'download') // Tells the backend to return the file

  try {
    const response = await fetch(API_ENDPOINT, { method: 'POST', body: formData })
    if (!response.ok) throw new Error(`Server error: ${response.status}`)
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name.replace('.xlsx', '.aasx')
    a.click()
    window.URL.revokeObjectURL(url)
    
    showSnackbar('AASX downloaded successfully!', 'success')
  } catch (error) {
    console.error(error)
    showSnackbar('Failed to download AASX. Is the backend running?', 'error')
  } finally {
    isProcessing.value = false
  }
}

const generateAndPushToServer = async () => {
  const file = getFileToUpload()
  if (!file) return

  isProcessing.value = true
  const formData = new FormData()
  formData.append('file', file)
  formData.append('action', 'push') // Tells the backend to push to BaSyx repo

  try {
    const response = await fetch(API_ENDPOINT, { method: 'POST', body: formData })
    if (!response.ok) throw new Error(`Server error: ${response.status}`)
    
    const result = await response.json()
    showSnackbar(result.message || 'Successfully pushed to BaSyx!', 'success')
  } catch (error) {
    console.error(error)
    showSnackbar('Failed to push to BaSyx server.', 'error')
  } finally {
    isProcessing.value = false
  }
}

const showSnackbar = (text: string, color: string) => {
  snackbar.value = { show: true, text, color }
}
</script>
