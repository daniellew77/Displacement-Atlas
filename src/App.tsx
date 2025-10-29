import DisplacementGlobe from './components/DisplacementGlobe'
import './index.css'
import { Analytics } from "@vercel/analytics/react"


function App() {
  return (
    <div className="w-full h-screen">
      <Analytics />
      <DisplacementGlobe />
    </div>
  );
}

export default App;