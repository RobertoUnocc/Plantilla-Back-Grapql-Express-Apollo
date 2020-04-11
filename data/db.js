import mongoose from 'mongoose'
// import bcrypt from 'bcrypt'  Hashear Contra

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/clientes',{userNewUrlParser:true})


const nombreSchema= new mongoose.Schema({
    nombre:String,
    apellido:String,
    empresa:String,
    emails:Array,
    edad:Number,
    tipo:String,
    pedidos:Array,
    VendedorID:mongoose.Types.ObjectId
})

// crear la tabla con el sgt Schema
const Tabla = mongoose.model('tabla',nombreSchema);

const Tabla2 = mongoose.model('tabla2',otroSchema);


export { Tabla, Tabla2 };