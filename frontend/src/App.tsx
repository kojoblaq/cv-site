import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { AdminLogin } from './pages/AdminLogin'
import { AdminShell } from './pages/AdminShell'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* intentionally subtle route name */}
        <Route path="/cx" element={<AdminLogin />} />
        <Route path="/cx/*" element={<AdminShell />} />
      </Routes>
    </BrowserRouter>
  )
}
