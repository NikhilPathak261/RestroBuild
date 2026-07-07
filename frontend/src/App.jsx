import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
