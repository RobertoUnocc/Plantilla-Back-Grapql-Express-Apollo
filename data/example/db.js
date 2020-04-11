import mongoose from 'mongoose'
import bcrypt from 'bcrypt'



mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/clientes',{userNewUrlParser:true})
// mongoose.set('setFindAndModify',false);



// Definir el Schema de Cliente
// Checar el Resolvers
const clientesSchema= new mongoose.Schema({
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
const Clientes = mongoose.model('clientes',clientesSchema);



// PRODUCTOS
const productosSchema= new mongoose.Schema({
    nombre:String,
    precio: Number,
    stock : Number
})

const Productos = mongoose.model('productos',productosSchema);



// Pedidos
const pedidoSchema= new mongoose.Schema({
    pedido: Array,
    total: Number,
    fecha: Date,
    cliente:mongoose.Types.ObjectId,
    estado:String,
    vendedor:mongoose.Types.ObjectId
})

const Pedidos = mongoose.model('pedidos',pedidoSchema);

// Usuarios
const usuariosSchema= new mongoose.Schema({
    usuario: String,
    nombre: String,
    password: String,
    rol:String
})

// hashear los password antes de guardarlos en ls bd
usuariosSchema.pre('save' , function(next){
   
    // si el password no esta modificado ejecutar la sig funcion
    if( !this.isModified('password') ) return next();

    bcrypt.genSalt(10, (error,salt) => {
        if(error) return next(error);

        bcrypt.hash(this.password, salt, (error,hash) =>{
              if(error) return next(error);
              this.password= hash;
              next()  ;
        });
    })

});

const Usuarios = mongoose.model('usuarios',usuariosSchema);



export { Clientes , Productos , Pedidos , Usuarios};