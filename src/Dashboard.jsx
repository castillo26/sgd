import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ResponderDocumento from "./ResponderDocumento";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [docs, setDocs] = useState([]);
  const [docsPendientes, setDocsPendientes] = useState([]);
  const [nuevaArea, setNuevaArea] = useState("");
  const [docSeleccionado, setDocSeleccionado] = useState(null);
  const [docVisualizar, setDocVisualizar] = useState(null);
  const [documentoResponder, setDocumentoResponder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [areas, setAreas] = useState([]);
  const [pdfAdjunto, setPdfAdjunto] = useState(null);

  const navigate = useNavigate();

  const cargarDocumentos = async (currentUser) => {
    const userData = currentUser || user;

    if (!userData) return;

    let url = "";

    if (userData.rol === "admin") {
      url = `http://localhost/sgd-api/documentos_area.php?area=${userData.area}`;
    } else {
      url = `http://localhost/sgd-api/mis_documentos.php?usuario_id=${userData.id}`;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();

      // Separar documentos pendientes (enviado) de los recibidos
      const pendientes = data.filter(doc => doc.estado === "enviado");
      const recibidos = data.filter(doc => doc.estado !== "enviado");

      setDocsPendientes(pendientes);
      setDocs(recibidos);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar documentos:", error);
      setLoading(false);
    }
  };

  const cargarAreas = async () => {
    try {
      const response = await fetch("http://localhost/sgd-api/areas.php");
      const data = await response.json();
      setAreas(data);
    } catch (error) {
      console.error("Error al cargar áreas:", error);
    }
  };

  const confirmarDerivacion = async () => {
    if (!nuevaArea) {
      alert("Seleccione un área");
      return;
    }

    const comentario = prompt("Ingrese comentario (opcional):") || "";

    const formData = new FormData();
    formData.append("id", docSeleccionado);
    formData.append("estado", "enviado");
    formData.append("comentario", comentario);
    formData.append("area_destino", nuevaArea);

    // Si hay PDF adjunto, agregarlo
    if (pdfAdjunto) {
      formData.append("pdf_adjunto", pdfAdjunto);
    }

    try {
      await fetch("http://localhost/sgd-api/actualizar_estado.php", {
        method: "POST",
        body: formData,
      });

      cargarDocumentos();
      setDocSeleccionado(null);
      setNuevaArea("");
      setPdfAdjunto(null);
    } catch (error) {
      console.error("Error al derivar:", error);
    }
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    let comentario = "";

    // Si es estado observado, el comentario es obligatorio
    if (nuevoEstado === "observado") {
      comentario = prompt("Ingrese la observación/motivo (OBLIGATORIO):") || "";
      if (!comentario.trim()) {
        alert("La observación es obligatoria para documentos observados");
        return;
      }
    } else {
      comentario = prompt("Ingrese comentario (opcional):") || "";
    }

    const formData = new FormData();
    formData.append("id", id);
    formData.append("estado", nuevoEstado);
    formData.append("comentario", comentario);
    formData.append("area_destino", user.area);
    formData.append("usuario_id", user.id);

    try {
      const response = await fetch("http://localhost/sgd-api/actualizar_estado.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Respuesta servidor:", result);

      if (response.ok) {
        cargarDocumentos();
        setDocVisualizar(null);
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  const handleVerPDF = (doc) => {
    setDocVisualizar(doc);
  };

  const estadoClass = (estado) => {
    const styles = {
      enviado: "bg-yellow-100 text-yellow-700 border-yellow-300",
      recibido: "bg-blue-100 text-blue-700 border-blue-300",
      "en proceso": "bg-orange-100 text-orange-700 border-orange-300",
      derivado: "bg-purple-100 text-purple-700 border-purple-300",
      finalizado: "bg-green-100 text-green-700 border-green-300",
      observado: "bg-red-100 text-red-700 border-red-300",
      "pendiente_evaluacion": "bg-cyan-100 text-cyan-700 border-cyan-300",
    };

    return styles[estado] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    if (!parsedUser) {
      navigate("/");
      return;
    }

    setUser(parsedUser);
    cargarDocumentos(parsedUser);
    cargarAreas();
  }, [navigate]);

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white px-8 py-6 rounded-2xl shadow-lg">
          <p className="text-gray-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-700 tracking-tight">
              Sistema de Gestión Documentaria
            </h1>
            <p className="text-sm text-slate-500">
              Municipalidad Distrital
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="font-semibold text-slate-800">{user.usuario}</p>
              <p className="text-sm text-slate-500 capitalize">{user.rol}</p>
            </div>

            <button
              onClick={logout}
              className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition font-medium"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10">

        {/* BIENVENIDA */}
        <section className="mb-10">
          <h2 className="text-3xl font-bold text-slate-800">
            Panel principal
          </h2>
          <p className="text-slate-500 mt-2">
            Administra y da seguimiento a los documentos de tu área.
          </p>
        </section>

        {/* TARJETAS */}
        <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">

          {user.rol === "admin" && (
            <div
              onClick={() => navigate("/mis-documentos")}
              className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
            >
              <h3 className="font-bold text-slate-800 mb-2">
                Mis documentos enviados
              </h3>
              <p className="text-sm text-slate-500">
                Seguimiento de documentos emitidos.
              </p>
            </div>
          )}
{/* 
          <div
            onClick={() => navigate("/documentos")}
            className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
          >
            <h3 className="font-bold text-slate-800 mb-2">
              {user.rol === "admin" ? "Documentos recibidos" : "Mis documentos"}
            </h3>
            <p className="text-sm text-slate-500">
              Gestión documental activa.
            </p>
          </div> */}

          <div
            onClick={() => navigate("/archivados")}
            className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
          >
            <h3 className="font-bold text-slate-800 mb-2">
              Archivados
            </h3>
            <p className="text-sm text-slate-500">
              Historial de documentos finalizados.
            </p>
          </div>

          <div
            onClick={() => navigate("/subir")}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
          >
            <h3 className="font-bold mb-2">
              {user.rol === "admin" ? "Subir documento" : "Enviar trámite"}
            </h3>
            <p className="text-sm text-blue-100">
              Registrar nuevo documento.
            </p>
          </div>

        </section>

        {/* SECCIÓN PENDIENTES DE REVISIÓN */}
        {user.rol === "admin" && docsPendientes.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-slate-200 bg-yellow-50">
              <h3 className="text-xl font-bold text-yellow-800">
                Pendientes de revisión ({docsPendientes.length})
              </h3>
              <p className="text-sm text-yellow-600 mt-1">
                Documentos que requieren su atención
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-5 py-4 text-left">Documento</th>
                    <th className="px-5 py-4 text-left">N° Informe</th>
                    <th className="px-5 py-4 text-left">Origen</th>
                    <th className="px-5 py-4 text-left">Estado</th>
                    <th className="px-5 py-4 text-left">Fecha</th>
                    <th className="px-5 py-4 text-left">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {docsPendientes.map((doc, index) => (
                    <tr
                      key={doc.id}
                      className={`border-t hover:bg-yellow-50 transition ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      }`}
                    >
                      <td className="px-5 py-4 font-medium text-slate-800">
                        {doc.nombre}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {doc.numero_informe || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {doc.origen}
                      </td>

                      <td className="px-5 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoClass(doc.estado)}`}>
                          {doc.estado}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {doc.fecha_subida || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleVerPDF(doc)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
                        >
                          Ver PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TABLA PRINCIPAL */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
            <h3 className="text-xl font-bold text-slate-800">
              {user.rol === "admin" ? "Documentos recibidos" : "Mis documentos"}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-5 py-4 text-left">Documento</th>
                  <th className="px-5 py-4 text-left">N° Informe</th>
                  <th className="px-5 py-4 text-left">Origen</th>
                  <th className="px-5 py-4 text-left">Estado</th>
                  <th className="px-5 py-4 text-left">Observación</th>
                  <th className="px-5 py-4 text-left">Actualización</th>
                  <th className="px-5 py-4 text-left">Archivo</th>
                  {user.rol === "admin" && <th className="px-5 py-4 text-left">Acciones</th>}
                </tr>
              </thead>

              <tbody>
                {docs.length === 0 ? (
                  <tr>
                    <td colSpan={user.rol === "admin" ? "8" : "7"} className="py-14 text-center text-slate-400">
                      No hay documentos disponibles
                    </td>
                  </tr>
                ) : (
                  docs.map((doc, index) => (
                    <tr
                      key={doc.id}
                      className={`border-t hover:bg-slate-50 transition ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      }`}
                    >
                      <td className="px-5 py-4 font-medium text-slate-800">
                        {doc.nombre}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {doc.numero_informe || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {doc.origen}
                      </td>

                      <td className="px-5 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoClass(doc.estado)}`}>
                          {doc.estado}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600 text-xs">
                        {doc.comentario || "-"}
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {(doc.fecha_aceptacion || doc.fecha_actualizacion)
                          ? new Date(
                              doc.fecha_aceptacion || doc.fecha_actualizacion
                            ).toLocaleString("es-PE")
                          : "-"}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleVerPDF(doc)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Ver PDF
                        </button>
                      </td>

                      {user.rol === "admin" && (
                        <td className="px-5 py-4">
                          <div className="flex gap-2 flex-wrap">
                            {(doc.estado === "recibido" || doc.estado === "en proceso" || doc.estado === "derivado") && (
                            <>
                              <button
                                onClick={() => setDocumentoResponder(doc)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                              >
                                Responder
                              </button>

                              <button
                                onClick={() => actualizarEstado(doc.id, "finalizado")}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                              >
                                Finalizar
                              </button>

                              <button
                                onClick={() => setDocSeleccionado(doc.id)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                              >
                                Derivar
                              </button>
                            </>
                          )}

                          {doc.estado === "pendiente_evaluacion" &&
 doc.area_destino_id == user.area && (
                            <>
                              <button
                                onClick={() => actualizarEstado(doc.id, "finalizado")}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                              >
                                ✓ Aceptar Respuesta
                              </button>

                              <button
                                onClick={() => actualizarEstado(doc.id, "observado")}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                              >
                                ✗ Observar Respuesta
                              </button>
                            </>
                          )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>
        </section>

      </main>

      {/* MODAL VISUALIZAR PDF */}
      {docVisualizar && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-[98vw] bg-white rounded-3xl shadow-2xl overflow-hidden h-[98vh] flex flex-col">

            {/* HEADER */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{docVisualizar.nombre}</h2>
                <p className="text-blue-100 text-sm mt-1">
                  N° Informe: {docVisualizar.numero_informe || "-"} | Origen: {docVisualizar.origen}
                </p>
              </div>
              <button
                onClick={() => setDocVisualizar(null)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition"
              >
                ✕ Cerrar
              </button>
            </div>

            {/* CONTENIDO */}
            <div className="flex-1 overflow-auto p-6 bg-slate-100">
              <iframe
                src={`http://localhost/sgd-api/${docVisualizar.archivo}`}
                className="w-full h-full rounded-xl border-0"
                title="PDF Viewer"
              />
            </div>

            {/* ACCIONES - Solo para estado enviado */}
            {user.rol === "admin" &&
 (
   docVisualizar.estado === "enviado" ||
   (
     docVisualizar.estado === "pendiente_evaluacion" &&
     docVisualizar.area_destino_id == user.area
   )
 ) && (
              <div className="px-8 py-6 bg-white border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
  {docVisualizar.estado === "pendiente_evaluacion"
    ? "Evaluar respuesta del área"
    : "Acciones sobre el documento"}
</h3>
                <div className="flex gap-4">
                  <button
  onClick={() =>
    actualizarEstado(
      docVisualizar.id,
      docVisualizar.estado === "pendiente_evaluacion"
        ? "finalizado"
        : "recibido")}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all"
                  >
                    {docVisualizar.estado === "pendiente_evaluacion"
  ? "✓ Aceptar Respuesta"
  : "✓ Aceptar Documento"}
                  </button>
                  <button
                    onClick={() => actualizarEstado(docVisualizar.id, "observado")}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all"
                  >
                    {docVisualizar.estado === "pendiente_evaluacion"
  ? "✗ Observar Respuesta"
  : "✗ Observar Documento"}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL DERIVAR */}
      {user.rol === "admin" && docSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">

            {/* HEADER */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 text-white">
              <h2 className="text-2xl font-bold">Derivar documento</h2>
              <p className="text-purple-100 text-sm mt-1">
                Seleccione el área de destino
              </p>
            </div>

            <div className="p-8">
              <select
                value={nuevaArea}
                onChange={(e) => setNuevaArea(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 mb-6 focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="">Seleccione área destino</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.nombre_area}
                  </option>
                ))}
              </select>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Adjuntar PDF adicional (opcional)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Si adjunta un PDF, se unirá con el documento original. El PDF adjunto aparecerá primero.
                </p>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfAdjunto(e.target.files[0])}
                  className="block w-full text-sm border border-gray-200 rounded-xl p-3
                  file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                  file:text-sm file:font-medium file:bg-purple-100 file:text-purple-700
                  hover:file:bg-purple-200 cursor-pointer"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={confirmarDerivacion}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  Confirmar derivación
                </button>
                <button
                  onClick={() => {
                    setDocSeleccionado(null);
                    setNuevaArea("");
                    setPdfAdjunto(null);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* RESPONDER DOCUMENTO */}
      {documentoResponder && (
        <ResponderDocumento
          documento={documentoResponder}
          onCancelar={() => setDocumentoResponder(null)}
          onRespondido={() => {
            setDocumentoResponder(null);
            cargarDocumentos();
          }}
        />
      )}

    </div>
  );
}

export default Dashboard;