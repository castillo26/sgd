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

          <table className="w-full text-left">

            <thead>

              <tr className="border-b">

                <th className="py-2">Documento</th>
                <th className="py-2">Origen</th>
                <th className="py-2">Destino</th>
                <th className="py-2">Estado</th>
                <th className="py-2">PDF</th>
                {user.rol === "admin" && <th className="py-2">Acciones</th>}

              </tr>

            </thead>

            <tbody>

              {docs.length === 0 ? (
                <tr>
                  <td colSpan={user.rol === "admin" ? "6" : "5"} className="py-6 text-center text-gray-400">
                    {user.rol === "admin" ? "No hay documentos para tu área" : "No has enviado documentos aún"}
                  </td>
                </tr>
              ) : (
                docs.map(doc => (
                  <tr key={doc.id} className="border-b">

                    <td className="py-3">
                      {doc.nombre}
                    </td>

                    <td className="text-gray-600">
                      {doc.origen}
                    </td>

                    <td className="text-gray-600">
                      {doc.destino}
                    </td>

                    <td>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        doc.estado === "enviado" ? "bg-yellow-200 text-yellow-800" :
                        doc.estado === "recibido" ? "bg-blue-200 text-blue-800" :
                        doc.estado === "en proceso" ? "bg-orange-200 text-orange-800" :
                        doc.estado === "derivado" ? "bg-purple-200 text-purple-800" :
                        doc.estado === "finalizado" ? "bg-green-200 text-green-800" :
                        "bg-gray-200"
                      }`}>
                        {doc.estado}
                      </span>
                    </td>

                    <td>

                      <a
                        href={`http://localhost/sgd-api/${doc.archivo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Ver PDF
                      </a>

                    </td>

                    {user.rol === "admin" && (
                      <td className="p-3 space-x-2">

                        <button
                        onClick={()=>actualizarEstado(doc.id,"recibido")}
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                        >
                        Aceptar
                        </button>

                        <button
                        onClick={()=>actualizarEstado(doc.id,"en proceso")}
                        className="bg-yellow-500 text-white px-1 rounded"
                        >
                        Proceso
                        </button>

                        <button
                        onClick={()=>actualizarEstado(doc.id,"finalizado")}
                        className="bg-green-600 text-white px-2 py-1 rounded"
                        >
                        Finalizar
                        </button>

                        <button
                        onClick={()=>setDocSeleccionado(doc.id)}
                        className="bg-purple-600 text-white px-2 py-1 rounded"
                        >
                        Derivar
                        </button>

                      </td>
                    )}

                  </tr>
                ))
              )}

            </tbody>

          </table>

          {user.rol === "admin" && docSeleccionado && (
<div className="mt-6 bg-white p-4 rounded shadow">

<h3 className="mb-2 font-bold">Derivar documento</h3>

<select
onChange={(e)=>setNuevaArea(e.target.value)}
className="border p-2 rounded w-full mb-3"
>

<option value="">Seleccionar área</option>
<option value="1">Administración</option>
<option value="2">Contabilidad</option>
<option value="3">Gerencia</option>
<option value="4">RRHH</option>

</select>

<button
onClick={()=>confirmarDerivacion()}
className="bg-purple-600 text-white px-4 py-2 rounded"
>
Confirmar derivación
</button>

</div>
)}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;