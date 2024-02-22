import { ConfigProvider} from "antd";
import {Routes, BrowserRouter, Route } from "react-router-dom";
import Admin from './admin/admin-pannel';
import Login from "./auth/login/login";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "Campton",
          fontSize: 15,
        }
      }}
    ><BrowserRouter>
    <Routes>
      <Route path="/" element={<Login/>} />
      <Route path='/admin'  element={<Admin/>} />
    </Routes>
  </BrowserRouter>
</ConfigProvider>
  )
}

export default App
