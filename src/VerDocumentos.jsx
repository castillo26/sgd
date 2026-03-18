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

await fetch("http://localhost/sgd-api/actualizar_estado.php",{
method:"POST",
body:formData
})

setDocSeleccionado(null)
setNuevaArea("")
window.location.reload()

}

const actualizarEstado = async (id, nuevoEstado, derivar = false) => {

let comentario = prompt("Ingrese comentario (opcional):") || ""
let nuevaArea = user.area

if(derivar){
  nuevaArea = prompt("Ingrese ID del área destino (ej: 2)") // luego lo mejoramos
}

const formData = new FormData()
formData.append("id", id)
formData.append("estado", nuevoEstado)
formData.append("comentario", comentario)
formData.append("area_destino", nuevaArea)

await fetch("http://localhost/sgd-api/actualizar_estado.php",{
method:"POST",
body:formData
})

window.location.reload()
}

const [nuevaArea, setNuevaArea] = useState("")
const [docSeleccionado, setDocSeleccionado] = useState(null)

const [docs,setDocs] = useState([])
const [loading,setLoading] = useState(true)
const navigate = useNavigate();

useEffect(()=>{

const user = JSON.parse(localStorage.getItem("user"))

fetch(`http://localhost/sgd-api/documentos_area.php?area=${user.area}`)
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
Documentos
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
<th className="p-3">Origen</th>
<th className="p-3">Destino</th>
<th className="p-3">Estado</th>
<th className="p-3">Fecha</th>
<th className="p-3">Archivo</th>

</tr>

</thead>

<tbody>

{loading ? (

<tr>
<td colSpan="6" className="p-6 text-center">
Cargando documentos...
</td>
</tr>

) : docs.length === 0 ? (

<tr>
<td colSpan="6" className="p-6 text-center">
No hay documentos
</td>
</tr>

) : (

docs.map(doc=>(

<tr key={doc.id} className="border-t hover:bg-gray-50">

<td className="p-3">
{doc.nombre}
</td>

<td className="p-3 text-center">
{doc.origen}
</td>

<td className="p-3 text-center">
{doc.destino}
</td>

<td className="p-3 text-center">

<span className={`px-3 py-1 rounded-full text-xs ${estadoColor(doc.estado)}`}>
{doc.estado}
</span>

</td>

<td className="p-3 text-center">
{doc.fecha_subida}
</td>

<td className="p-3 text-center">

<a
href={`http://localhost/sgd-api/${doc.archivo}`}
target="_blank"
className="text-blue-600 hover:underline"
>
Abrir PDF
</a>

</td>

<td className="p-3 space-x-2">

                      <button
                      onClick={()=>actualizarEstado(doc.id,"recibido")}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                      >
                      Aceptar
                      </button>

                      <button
                      onClick={()=>actualizarEstado(doc.id,"en proceso")}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
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

</tr>

))

)}

</tbody>

</table>

{docSeleccionado && (
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