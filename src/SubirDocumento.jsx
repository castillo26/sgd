import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SubirDocumento(){

const [nombre,setNombre] = useState("")
const [archivo,setArchivo] = useState(null)
const [areaDestino,setAreaDestino] = useState("")
const [mensaje,setMensaje] = useState("")
const [tiposDocumento, setTiposDocumento] = useState([])

const navigate = useNavigate()

useEffect(() => {
    const cargarTipos = async () => {
        try {
            const res = await fetch("http://localhost/sgd-api/obtener_tipos.php")
            const data = await res.json()
            if (data.success) {
                setTiposDocumento(data.data)
            }
        } catch (err) {
            console.error("Error al cargar tipos:", err)
        }
    }
    cargarTipos()
}, [])

const user = JSON.parse(localStorage.getItem("user"))

const subir = async(e)=>{

e.preventDefault()

if(!archivo){
setMensaje("Debe seleccionar un archivo")
return
}

if(archivo.type !== "application/pdf"){
setMensaje("Solo se permiten archivos PDF")
return
}

const formData = new FormData()

formData.append("nombre",nombre)
formData.append("archivo",archivo)
formData.append("usuario_id",user.id)
formData.append("area_origen",user.area)
formData.append("area_destino",areaDestino)

try{

const res = await fetch("http://localhost/sgd-api/subir_documento.php",{
method:"POST",
body:formData
})

const data = await res.json()

if(data.success){
setMensaje("Documento enviado correctamente")
setTimeout(()=>{
navigate("/documentos")
},1200)
}else{
setMensaje("Error al subir documento")
}

}catch(err){
setMensaje("Error del servidor")
}

}

return(

<div className="min-h-screen bg-gray-100 p-10">

<div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow">

<h1 className="text-2xl font-bold mb-6">
Subir Documento
</h1>

<form onSubmit={subir} className="space-y-4">

<select
value={nombre}
onChange={(e)=>setNombre(e.target.value)}
className="border p-2 w-full rounded"
required
>
<option value="">Seleccionar tipo de documento</option>
{tiposDocumento.map((tipo) => (
    <option key={tipo.doc_codID} value={tipo.tipo}>
        {tipo.tipo}
    </option>
))}
</select>

<select
value={areaDestino}
onChange={(e)=>setAreaDestino(e.target.value)}
className="border p-2 w-full rounded"
required
>

<option value="">Seleccionar área destino</option>
<option value="1">Administración</option>
<option value="2">Contabilidad</option>
<option value="3">Gerencia</option>
<option value="4">RRHH</option>

</select>

<input
type="file"
accept="application/pdf"
onChange={(e)=>setArchivo(e.target.files[0])}
/>
<br />
<button
className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
>
Subir Documento
</button>

</form>

{mensaje && (
<p className="mt-4 text-sm text-gray-700">
{mensaje}
</p>
)}

<div className="mt-6">

<button
onClick={()=>navigate("/dashboard")}
className="bg-gray-500 text-white px-5 py-2 rounded hover:bg-gray-600"
>

Volver al Dashboard

</button>

</div>

</div>

</div>

)

}

export default SubirDocumento