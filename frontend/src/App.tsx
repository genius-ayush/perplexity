// import { Button } from "@/components/ui/button"
import { BrowserRouter, Route, Routes } from "react-router";
import Auth from "./components/pages/Auth";
import Dashboard from "./components/pages/Conversations";

export function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<Dashboard/>}/>
    </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
