import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import Dashboard from '@/pages/Dashboard';
import CaseList from '@/pages/CaseList';
import CaseDetail from '@/pages/CaseDetail';
import Dispute from '@/pages/Dispute';
import Transfer from '@/pages/Transfer';
import Acceptance from '@/pages/Acceptance';
import Statistics from '@/pages/Statistics';
import Search from '@/pages/Search';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cases" element={<CaseList />} />
          <Route path="/cases/:id" element={<CaseDetail />} />
          <Route path="/cases/:id/dispute" element={<Dispute />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/acceptance" element={<Acceptance />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/search" element={<Search />} />
        </Route>
      </Routes>
    </Router>
  );
}
