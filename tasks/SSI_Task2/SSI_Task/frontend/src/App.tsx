import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layouts/Layout';
import { Dashboard } from './pages/Dashboard';
import { Connections } from './pages/Connections';
import { Credentials } from './pages/Credentials';
import { Verification } from './pages/Verification';
import { Issuance } from './pages/Issuance';
import { DIDManagement } from './pages/DIDManagement';
import { SSIProvider } from './hooks/SSIContext';


function App() {
  return (
    <SSIProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/credentials" element={<Credentials />} />
            <Route path="/issuance" element={<Issuance />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/dids" element={<DIDManagement />} />
          </Routes>
        </Layout>
      </Router>
    </SSIProvider>
  );
}

export default App;