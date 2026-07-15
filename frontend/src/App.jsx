import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import PageTitle from './components/PageTitle.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <PageTitle />
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
