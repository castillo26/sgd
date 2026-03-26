import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

await fetch("http://localhost/sgd-api/actualizar_estado.php",{
method:"POST",
body:formData
})

setDocSeleccionado(null)
setNuevaArea("")
window.location.reload()

}

const actualizarEstado = async (id, nuevoEstado) => {

const comentario = prompt("Ingrese comentario (opcional):") || ""

const formData = new FormData()
formData.append("id", id)
formData.append("estado", nuevoEstado)
formData.append("comentario", comentario)
formData.append("area_destino", user.area)

await fetch("http://localhost/sgd-api/actualizar_estado.php",{
method:"POST",
body:formData
})

window.location.reload()
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

    <div className="min-h-screen bg-gray-100">

      {/* NAVBAR */}
      <div className="bg-white shadow-md px-8 py-4 flex justify-between items-center">

        <h1 className="text-xl font-bold text-blue-600">
          SGD
        </h1>

        <div className="flex gap-6">

          <button
            className="text-gray-700 hover:text-blue-600 font-medium"
            onClick={() => navigate("/documentos")}
          >
            Ver documentos
          </button>

          <button
            className="text-gray-700 hover:text-blue-600 font-medium"
            onClick={() => navigate("/subir")}
          >
            {user.rol === "admin" ? "Subir documentos" : "Enviar trámite"}
          </button>

          <button
            onClick={logout}
            className="text-red-500 hover:text-red-600 font-medium"
          >
            Cerrar sesión
          </button>

        </div>

      </div>


      {/* CONTENIDO */}
      <div className="p-10">

        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Bienvenido
        </h2>

        <p className="text-gray-500 mb-10">
          {user.correo}
        </p>


        {/* TARJETAS */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">

          <div
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
            onClick={() => navigate("/documentos")}
          >
            <h3 className="text-lg font-semibold mb-2">
              {user.rol === "admin" ? "Ver documentos" : "Mis documentos"}
            </h3>
            <p className="text-gray-500 text-sm">
              {user.rol === "admin"
                ? "Revisa y gestiona los documentos de tu área."
                : "Consulta el estado de tus trámites enviados."}
            </p>
          </div>


          {(user.rol === "admin" || user.rol === "usuario") && (
            <div
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate("/subir")}
            >
              <h3 className="text-lg font-semibold mb-2">
                {user.rol === "admin" ? "Subir documentos" : "Enviar trámite"}
              </h3>
              <p className="text-gray-500 text-sm">
                {user.rol === "admin"
                  ? "Envía documentos a otras áreas."
                  : "Envía un documento para iniciar un trámite."}
              </p>
            </div>
          )}

        </div>


        {/* TABLA DE DOCUMENTOS */}
        <div className="bg-white p-6 rounded-xl shadow">

          <h3 className="text-xl font-bold mb-6">
            {user.rol === "admin" ? "Documentos recibidos" : "Mis documentos"}
          </h3>

          <table className="w-full text-left border-collapse">

            <thead>

              <tr className="bg-gray-100 border-b-2 border-gray-300">

                <th className="py-3 px-4 font-semibold text-gray-700">Documento</th>
                <th className="py-3 px-4 font-semibold text-gray-700">N° Informe</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Origen</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Destino</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Estado</th>
                <th className="py-3 px-4 font-semibold text-gray-700">PDF</th>
                {user.rol === "admin" && <th className="py-3 px-4 font-semibold text-gray-700">Acciones</th>}

              </tr>

            </thead>

            <tbody>

              {docs.length === 0 ? (
                <tr>
                  <td colSpan={user.rol === "admin" ? "7" : "6"} className="py-8 text-center text-gray-400">
                    {user.rol === "admin" ? "No hay documentos para tu área" : "No has enviado documentos aún"}
                  </td>
                </tr>
              ) : (
                docs.map((doc, index) => (
                  <tr
                    key={doc.id}
                    className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >

                    <td className="py-4 px-4 font-medium text-gray-800">
                      {doc.nombre}
                    </td>

                    <td className="py-4 px-4 text-gray-600">
                      {doc.numero_informe || '-'}
                    </td>

                    <td className="py-4 px-4 text-gray-600">
                      {doc.origen}
                    </td>

                    <td className="py-4 px-4 text-gray-600">
                      {doc.destino}
                    </td>

                    <td className="py-4 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        doc.estado === "enviado" ? "bg-yellow-100 text-yellow-700 border border-yellow-300" :
                        doc.estado === "recibido" ? "bg-blue-100 text-blue-700 border border-blue-300" :
                        doc.estado === "en proceso" ? "bg-orange-100 text-orange-700 border border-orange-300" :
                        doc.estado === "derivado" ? "bg-purple-100 text-purple-700 border border-purple-300" :
                        doc.estado === "finalizado" ? "bg-green-100 text-green-700 border border-green-300" :
                        "bg-gray-100 text-gray-700 border border-gray-300"
                      }`}>
                        {doc.estado}
                      </span>
                    </td>

                    <td className="py-4 px-4">

                      <a
                        href={`http://localhost/sgd-api/${doc.archivo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        Ver PDF
                      </a>

                    </td>

                    {user.rol === "admin" && (
                      <td className="py-4 px-4">

                        <div className="flex flex-wrap gap-2">
                          <button
                          onClick={()=>actualizarEstado(doc.id,"recibido")}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                          >
                          Aceptar
                          </button>

                          <button
                          onClick={()=>actualizarEstado(doc.id,"en proceso")}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                          >
                          Proceso
                          </button>

                          <button
                          onClick={()=>actualizarEstado(doc.id,"finalizado")}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                          >
                          Finalizar
                          </button>

                          <button
                          onClick={()=>setDocSeleccionado(doc.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                          >
                          Derivar
                          </button>
                        </div>

                      </td>
                    )}

                  </tr>
                ))
              )}

            </tbody>

          </table>

          {user.rol === "admin" && docSeleccionado && (
            <div className="mt-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">

              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Derivar documento
              </h3>

              <div className="space-y-4">
                <select
                  onChange={(e)=>setNuevaArea(e.target.value)}
                  className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Seleccionar área</option>
                  <option value="1">Administración</option>
                  <option value="2">Contabilidad</option>
                  <option value="3">Gerencia</option>
                  <option value="4">RRHH</option>
                </select>

                <button
                  onClick={()=>confirmarDerivacion()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Confirmar derivación
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;