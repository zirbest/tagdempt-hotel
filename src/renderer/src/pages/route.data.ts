import { cache } from '@solidjs/router'

export const getOrganizations = cache(async (search) => {
  return await window.electron.ipcRenderer.invoke('organizations-read', search)
}, 'organizations')
