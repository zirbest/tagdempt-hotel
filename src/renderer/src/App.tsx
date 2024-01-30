import type { Component } from 'solid-js'
import { Route, HashRouter as Router } from '@solidjs/router'
import { AuthProvider } from './composables/auth'
import Login from './pages/login'
import Layout from './pages/default.layout'
import Invoices, { loadInvoice } from './pages/invoices'
import Services, { loadServices } from './pages/services'

function rootLayout(props) {
  return (
    <AuthProvider>
      {props.children}
    </AuthProvider>
  )
}

const App: Component = () => {
  return (
    <Router root={rootLayout}>
      <Route path="/" component={Layout}>
        <Route path="/" load={loadInvoice} component={Invoices} />
        <Route path="/services" load={loadServices} component={Services} />
      </Route>
      <Route path="/login" component={Login} />
    </Router>
  )
}

export default App
