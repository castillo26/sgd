import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Login } from "./Login";
import Dashboard from "./Dashboard";
import ProtectedRoute from "./ProtectedRoute";

import VerDocumentos from "./VerDocumentos";
import SubirDocumento from "./SubirDocumento";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* VER DOCUMENTOS */}
        <Route
          path="/documentos"
          element={
            <ProtectedRoute>
              <VerDocumentos />
            </ProtectedRoute>
          }
        />

        {/* SUBIR DOCUMENTOS */}
        <Route
          path="/subir"
          element={
            <ProtectedRoute>
              <SubirDocumento />
            </ProtectedRoute>
          }
        />

        {/* REDIRECCIÓN SI LA RUTA NO EXISTE */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>

    </BrowserRouter>

  );

}

export default App;