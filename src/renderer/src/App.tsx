import type { Component } from 'solid-js'
import { Route, HashRouter as Router } from '@solidjs/router'
import { AuthProvider } from './composables/auth'
import Login from './pages/login'
import Layout from './pages/default.layout'
import { Toaster } from './components/ui/toast'
import Organizations, { loadOrganizations } from './pages/organization'
import { loadInvoice, loadServices } from './pages/route.data'
import Invoices from './pages/invoices'
import Services from './pages/services'

function rootLayout(props) {
  return (
    <AuthProvider>
      {props.children}
      <Toaster class="print:hidden" />
    </AuthProvider>
  )
}

const App: Component = () => {
  return (
    <Router root={rootLayout}>
      <Route path="/" component={Layout}>
        <Route path="/" load={loadInvoice} component={Invoices} />
        <Route path="/services" load={loadServices} component={Services} />
        <Route path="/organizations" load={loadOrganizations} component={Organizations} />
      </Route>
      <Route path="/login" component={Login} />
    </Router>
  )
}

export default App
