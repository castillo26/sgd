import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function VerDocumentos(){

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
await fetch("https://sgd.munihualmay.gob.pe/sgd-api/actualizar_estado.php",{
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

const actualizarEstado = async (id, nuevoEstado, derivar = false) => {

let comentario = ""
let nuevaArea = user.area

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

if(derivar){
  nuevaArea = prompt("Ingrese ID del área destino (ej: 2)") // luego lo mejoramos
}

const formData = new FormData()
formData.append("id", id)
formData.append("estado", nuevoEstado)
formData.append("comentario", comentario)
formData.append("area_destino", nuevaArea)

try {
await fetch("https://sgd.munihualmay.gob.pe/sgd-api/actualizar_estado.php",{
method:"POST",
body:formData
})

// Actualizar estado local sin recargar la página
setDocs(prevDocs => prevDocs.map(doc =>
  String(doc.id) === String(id) ? { ...doc, estado: nuevoEstado, comentario: comentario } : doc
))
} catch (error) {
console.error("Error al actualizar estado:", error)
}
}

const [nuevaArea, setNuevaArea] = useState("")
const [docSeleccionado, setDocSeleccionado] = useState(null)

const [docs,setDocs] = useState([])
const [loading,setLoading] = useState(true)
const [user,setUser] = useState(null)
const navigate = useNavigate();

useEffect(()=>{

const storedUser = JSON.parse(localStorage.getItem("user"))
setUser(storedUser)

// CARGAR DOCUMENTOS SEGÚN EL ROL
let url = "";
if (storedUser.rol === "admin") {
  // Admin: ve documentos de su área (recibidos) Y los que envió
  url = `https://sgd.munihualmay.gob.pe/sgd-api/documentos_area.php?area=${storedUser.area}&usuario_id=${storedUser.id}`;
} else {
  // Usuario: ve solo sus propios documentos
  url = `https://sgd.munihualmay.gob.pe/sgd-api/mis_documentos.php?usuario_id=${storedUser.id}`;
}

fetch(url)
.then(res=>res.json())
.then(data=>{
setDocs(data)
setLoading(false)
})

},[])

const estadoColor = (estado)=>{

switch(estado){

case "enviado":
return "bg-yellow-200 text-yellow-800"

case "recibido":
return "bg-blue-200 text-blue-800"

case "revisado":
return "bg-green-200 text-green-800"

default:
return "bg-gray-200"

}

}

return(

<div className="min-h-screen bg-gray-100 p-10">

<h1 className="text-2xl font-bold mb-6">
{user && user.rol === "admin" ? "Documentos del área" : "Mis documentos"}
</h1>

<button
onClick={()=>navigate("/dashboard")}
className="mb-6 bg-gray-600 text-white px-5 py-2 rounded hover:bg-gray-700"
>

Volver al Dashboard

</button>

<div className="bg-white shadow rounded-xl overflow-hidden">

<table className="w-full">

<thead className="bg-gray-50">

<tr>

<th className="p-3 text-left">Documento</th>
<th className="p-3">N° Informe</th>
<th className="p-3">Origen</th>
<th className="p-3">Destino</th>
<th className="p-3">Estado</th>
<th className="p-3">Observación</th>
<th className="p-3">Fecha</th>
<th className="p-3">Archivo</th>
{user && user.rol === "admin" && <th className="p-3">Acciones</th>}

</tr>

</thead>

<tbody>

{loading ? (

<tr>
<td colSpan={user && user.rol === "admin" ? "9" : "8"} className="p-6 text-center">
Cargando documentos...
</td>
</tr>

) : docs.length === 0 ? (

<tr>
<td colSpan={user && user.rol === "admin" ? "9" : "8"} className="p-6 text-center">
{user && user.rol === "admin" ? "No hay documentos para tu área" : "No has enviado documentos aún"}
</td>
</tr>

) : (

docs.map(doc=>(

<tr key={doc.id} className="border-t hover:bg-gray-50">

<td className="p-3">
{doc.nombre}
</td>

<td className="p-3 text-center">
{doc.numero_informe}
</td>

<td className="p-3 text-center">
{doc.origen}
</td>

<td className="p-3 text-center">
{doc.destino}
</td>

<td className="p-3 text-center">

<span className={`px-3 py-1 rounded-full text-xs ${
  doc.estado === "enviado" ? "bg-yellow-200 text-yellow-800" :
  doc.estado === "recibido" ? "bg-blue-200 text-blue-800" :
  doc.estado === "en proceso" ? "bg-orange-200 text-orange-800" :
  doc.estado === "derivado" ? "bg-purple-200 text-purple-800" :
  doc.estado === "finalizado" ? "bg-green-200 text-green-800" :
  doc.estado === "observado" ? "bg-red-200 text-red-800" :
  "bg-gray-200"
}`}>
{doc.estado}
</span>

</td>

<td className="p-3 text-center">
{doc.comentario ? (
  <span className="text-red-600 text-xs" title={doc.comentario}>
    {doc.comentario.length > 30 ? doc.comentario.substring(0, 30) + "..." : doc.comentario}
  </span>
) : (
  <span className="text-gray-400 text-xs">-</span>
)}
</td>

<td className="p-3 text-center">
{doc.fecha_subida}
</td>

<td className="p-3 text-center">

<a
href={`https://sgd.munihualmay.gob.pe/sgd-api/${doc.archivo}`}
target="_blank"
className="text-blue-600 hover:underline"
>
Abrir PDF
</a>

</td>

{user && user.rol === "admin" && (
                      <td className="p-3 space-x-2">
                      {/* Aceptar: Solo cuando está en "enviado" */}
                      {doc.estado === "enviado" && (
                        <button
                          onClick={()=>actualizarEstado(doc.id,"recibido")}
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                          Aceptar
                        </button>
                      )}

                      {/* Proceso: Solo cuando ya fue aceptado */}
                      {doc.estado === "recibido" && (
                        <button
                          onClick={()=>actualizarEstado(doc.id,"en proceso")}
                          className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                        >
                          Proceso
                        </button>
                      )}

                      {/* Finalizar: Solo cuando ya fue aceptado */}
                      {(doc.estado === "recibido" || doc.estado === "en proceso") && (
                        <button
                          onClick={()=>actualizarEstado(doc.id,"finalizado")}
                          className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                        >
                          Finalizar
                        </button>
                      )}

                      {/* Derivar: Cuando fue aceptado o está en proceso */}
                      {(doc.estado === "recibido" || doc.estado === "en proceso") && (
                        <button
                          onClick={()=>setDocSeleccionado(doc.id)}
                          className="bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
                        >
                          Derivar
                        </button>
                      )}

                      {/* Observar: Cuando fue aceptado o está en proceso */}
                      {(doc.estado === "recibido" || doc.estado === "en proceso") && (
                        <button
                          onClick={()=>actualizarEstado(doc.id,"observado")}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Observar
                        </button>
                      )}
                    </td>
                  )}

</tr>

))

)}

</tbody>

</table>

{user && user.rol === "admin" && docSeleccionado && (
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

)

}

export default VerDocumentos