import { cache } from '@solidjs/router'

// invoices
export const getInvoices = cache(async (search) => {
  return await window.electron.ipcRenderer.invoke('invoices-read', search)
}, 'invoices')

export function loadInvoice({ location }) {
  void getInvoices(location.query.search)
}

// services
export const getServices = cache(async (search?) => {
  return await window.electron.ipcRenderer.invoke('services-read', search)
}, 'services')

export function loadServices({ location }) {
  void getServices(location.query.search)
}

// organization
export const getOrganizations = cache(async (search?) => {
  return await window.electron.ipcRenderer.invoke('organizations-read', search)
}, 'organizations')

export function loadOrganizations({ location }) {
  void getOrganizations(location.query.search)
}
