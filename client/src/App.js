import Home from './components/Home';
import Login from './components/Login';
import { Route, Routes, Link } from 'react-router-dom';
import ProtectedRoute from './components/Protectedroute';

function App() {
  return (<>
    <Routes>
      <Route path="/" element={<Login />}></Route>
      <Route path="/chat" element={<ProtectedRoute>
        <Home />
      </ProtectedRoute>}></Route>

    </Routes>

  </>
  );
}

export default App;
