import { Provider } from 'react-redux';
import './App.css'
import AppRoutes from './AppRoutes'

function App() {


  return (
    <>
    <Provider>
      <AppRoutes />
      </Provider>
    </>
  )
}

export default App
