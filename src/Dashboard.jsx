import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ResponderDocumento from "./ResponderDocumento";

function Dashboard() {

const confirmarDerivacion = async () => {

if(!nuevaArea){
alert("Seleccione un área")
return
}

const comentario = prompt("Ingrese comentario (opcional):") || ""

const formData = new FormData()
formData.append("id", docSeleccionado)
formData.append("estado", "derivado")
formData.append("comentario", comentario)
formData.append("area_destino", nuevaArea)

try {
await fetch("http://localhost/sgd-api/actualizar_estado.php",{
method:"POST",
body:formData
})

// Actualizar estado local sin recargar la página
setDocs(prevDocs => prevDocs.map(doc =>
  String(doc.id) === String(docSeleccionado) ? { ...doc, estado: "derivado" } : doc
))

setDocSeleccionado(null)
setNuevaArea("")
} catch (error) {
console.error("Error al derivar:", error)
}
}

const actualizarEstado = async (id, nuevoEstado) => {

let comentario = ""

// Si es estado observado, el comentario es obligatorio
if(nuevoEstado === "observado"){
  comentario = prompt("Ingrese la observación/motivo (OBLIGATORIO):") || ""
  if(!comentario.trim()){
    alert("La observación es obligatoria para documentos observados")
    return
  }
} else {
  comentario = prompt("Ingrese comentario (opcional):") || ""
}

const formData = new FormData()
formData.append("id", id)
formData.append("estado", nuevoEstado)
formData.append("comentario", comentario)
formData.append("area_destino", user.area)
formData.append("usuario_id", user.id)

try {
const response = await fetch("http://localhost/sgd-api/actualizar_estado.php",{
method:"POST",
body:formData
})

const result = await response.json()
console.log("Respuesta servidor:", result)

if (response.ok) {
  // 🔥 Recargar documentos desde el backend
  let url = "";

  if (user.rol === "admin") {
    url = `http://localhost/sgd-api/documentos_area.php?area=${user.area}`;
  } else {
    url = `http://localhost/sgd-api/mis_documentos.php?usuario_id=${user.id}`;
  }

  const updated = await fetch(url);
  const data = await updated.json();
  setDocs(data);
}
} catch (error) {
console.error("Error al actualizar estado:", error)
}
}

  const [nuevaArea, setNuevaArea] = useState("")
  const [docSeleccionado, setDocSeleccionado] = useState(null)

  const [user, setUser] = useState(null);
  const [docs, setDocs] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {

    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    if (!parsedUser) {
      navigate("/");
      return;
    }

    setUser(parsedUser);

    // CARGAR DOCUMENTOS SEGÚN EL ROL
    let url = "";
    if (parsedUser.rol === "admin") {
      // Admin: ve documentos de su área
      url = `http://localhost/sgd-api/documentos_area.php?area=${parsedUser.area}`;
    } else {
      // Usuario: ve solo sus propios documentos
      url = `http://localhost/sgd-api/mis_documentos.php?usuario_id=${parsedUser.id}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => setDocs(data))
      .catch(err => console.error(err));

  }, [navigate]);


  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) {
    return <h2 className="text-center mt-10 text-xl">Cargando...</h2>;
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
      <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

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
        </div>

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

      {/* TABLA */}
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
              </tr>
            </thead>

            <tbody>
              {docs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-14 text-center text-slate-400">
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
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        doc.estado === "enviado"
                          ? "bg-yellow-100 text-yellow-700"
                          : doc.estado === "recibido"
                          ? "bg-blue-100 text-blue-700"
                          : doc.estado === "en proceso"
                          ? "bg-orange-100 text-orange-700"
                          : doc.estado === "derivado"
                          ? "bg-purple-100 text-purple-700"
                          : doc.estado === "finalizado"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
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
                      <a
                        href={`http://localhost/sgd-api/${doc.archivo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Ver PDF
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </section>

    </main>
  </div>
);
}

export default Dashboard;