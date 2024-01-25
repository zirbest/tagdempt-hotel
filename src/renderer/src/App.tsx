import type { Component } from 'solid-js'
import { Route, Router, Routes } from '@solidjs/router'
import { AuthProvider } from './composables/auth'
import Login from './pages/login'
import Layout from './pages/default.layout'
import Invoices, { InvoicesData } from './pages/invoices'

const App: Component = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" component={Layout}>
            <Route path="/" data={InvoicesData} component={Invoices} />
          </Route>
          <Route path="/login" component={Login} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
