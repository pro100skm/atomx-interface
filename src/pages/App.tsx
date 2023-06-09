import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Div from '../components/Common/Div';
import Header from '../components/Header';
import PageLoading from '../components/PageLoading';
import Web3ReactManager from '../components/Web3ReactManager';
import useEagerConnect from '../hooks/useEagerConnect';
import useEagerFetchData from '../hooks/useEagerFetchData';
import useTheme from '../hooks/useTheme';

const Transactions = lazy(() => import('./transactions'));
const Swap = lazy(() => import('./swap'));

function App() {
  useEagerFetchData();
  useEagerConnect();
  useTheme();

  const isDark = localStorage.getItem('isDark');
  if (isDark !== 'false') {
    localStorage.setItem('isDark', JSON.stringify(false));
  }

  return (
    <Web3ReactManager>
      <BrowserRouter>
        <Header />
        <Div display='flex' minHeight='94%'>
          <Suspense fallback={<PageLoading />}>
            <Div margin='5.5rem auto 2rem' width='85vw' maxWidth='2500px' height='auto'>
              <Routes>
                <Route path='/swap/*' element={<Swap />} />
                <Route path='/txs/*' element={<Transactions />} />
                <Route path='*' element={<Navigate to='/swap' replace />} />
              </Routes>
            </Div>
          </Suspense>
        </Div>
      </BrowserRouter>
    </Web3ReactManager>
  );
}

export default App;
