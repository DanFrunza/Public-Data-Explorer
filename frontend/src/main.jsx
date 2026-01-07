import { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthBootstrap from './components/AuthBootstrap.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <AuthBootstrap />
      <App />
    </Provider>
  </StrictMode>
)
