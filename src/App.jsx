import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Login } from "./Login";
import { Register } from "./Register";
import Dashboard from "./Dashboard";
import ProtectedRoute from "./ProtectedRoute";

import VerDocumentos from "./VerDocumentos";
import SubirDocumento from "./SubirDocumento";
import MisDocumentosAdmin from "./MisDocumentosAdmin";

import DocumentosArchivados from "./DocumentosArchivados";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* REGISTRO */}
        <Route path="/register" element={<Register />} />

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

        {/* DOCUMENTOS ARCHIVADOS */}
        <Route
          path="/archivados"
          element={
            <ProtectedRoute>
              <DocumentosArchivados />
            </ProtectedRoute>
          }
        />

        {/* MIS DOCUMENTOS ADMIN */}
        <Route
          path="/mis-documentos"
          element={
            <ProtectedRoute>
              <MisDocumentosAdmin />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;