// import { Button } from "@/components/ui/button"
import { BrowserRouter, Route, Routes } from "react-router";
import Auth from "./components/pages/Auth";
import Dashboard from "./components/pages/Conversations";
import Landing from "./app/routes/landing";

export function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
      <Route path="/" element={<Landing/>}/>
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard/>}/>
    </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
