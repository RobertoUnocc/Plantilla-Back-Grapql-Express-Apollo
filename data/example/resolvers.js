import mongoose from 'mongoose'
import { Clientes, Productos ,Pedidos , Usuarios} from "./db"
import { rejects } from 'assert'
import bcrypt from 'bcrypt'

// GenerarToken

import dotenv from 'dotenv';
dotenv.config({path:'variables.env'})

import jwt from 'jsonwebtoken';

const crearToken = (usuarioLogin,secreto,expiresIn)=>{
	const {usuario} = usuarioLogin;

	return jwt.sign({usuario},secreto, {expiresIn});
}



const ObjectId= mongoose.Types.ObjectId;

export const resolvers = {
	Query: {


			// -----------filtrar para cada vendedor-
			// getClientes:(root,{limite , offset})=>{
			// 	return Clientes.find({}).limit(limite).skip(offset)
			// },

			getClientes:(root,{limite , offset,VendedorID})=>{
				let filtro;
				if (VendedorID) {
					// para convertir de un String de ID a ID real
					filtro = {VendedorID : new ObjectId(VendedorID)}
				}
				return Clientes.find(filtro).limit(limite).skip(offset)
			},

			getCliente: (root, { id }) => {
				return new Promise((resolve,object)=>{
					Clientes.findById(id, (error,cliente)=>{
						if (error) rejects(error)
							else resolve(cliente) 
						})

				})
			},

			totalClientes:(root,{VendedorID}) =>{
				return new Promise( (resolve,object)=>{
					let filtro;
					if (VendedorID) {
						// para convertir de un String de ID a ID real
						filtro = {VendedorID : new ObjectId(VendedorID)}
					}

					Clientes.countDocuments(filtro,(error,count)=>{
						if(error) rejects(error);
						else resolve(count);
					})

				})
			},

			//Filtrar los productos que tienen mas de cero en Stock  

			// obtenerProductos:(root, { limite, offset})=> {
			// 	return Productos.find({}).limit(limite).skip(offset)
			// },

			obtenerProductos:(root, { limite, offset, stock })=> {
				let  filtro;

				if (stock) {
					filtro = {stock : {$gt : 0}} 
				}
				
				return Productos.find(filtro).limit(limite).skip(offset)
			},

			obtenerProducto: (root, { id }) => {
				return new Promise((resolve,object)=>{
					Productos.findById(id, (error,producto)=>{
						if (error) rejects(error)
							else resolve(producto) 
						})

				})
			},
			totalProductos:(root) =>{
				return new Promise( (resolve,object)=>{
					Productos.countDocuments({},(error,count)=>{
						if(error) rejects(error);
						else resolve(count);
					})

				})
			},

			totalPedidosCliente:(root,{id_cliente}) =>{
				return new Promise( (resolve,object)=>{
					Pedidos.find({cliente: id_cliente},(error,todosPedidos)=>{
						if(error) rejects(error);
						else resolve(todosPedidos);
					})

				})
			},

			topClientes :(root) =>{
				return new Promise( (resolve,object)=>{
					
					Pedidos.aggregate([
					{
						$match: {estado: "COMPLETADO"}
					},
					{
						$group: {
							_id: "$cliente",
							total: {$sum : "$total"}
						}
					},
					{
						$lookup : {
							from: "clientes",
							localField: '_id',
							foreignField: '_id',
							as : 'cliente'
						}
					},
					{
						$sort:{ total:-1}
					},
					{
						$limit: 10
					}
					], (error,resultado)=>{
						if(error) rejects(error)
							else resolve(resultado)
						})

				})
			},
			obtenerUsuario : (root, args, {usuarioActual}) => {
				if(!usuarioActual) return null;
				console.log(usuarioActual)

				const usuario= Usuarios.findOne({usuario: usuarioActual.usuario});

				return usuario;
			},
			topVendedores :(root) =>{
				return new Promise( (resolve,object)=>{
					
					Pedidos.aggregate([
					{
						$match: {estado: "COMPLETADO"}
					},
					{
						$group: {
							_id: "$vendedor",
							total: {$sum : "$total"}
						}
					},
					{
						$lookup : {
							from: "usuarios",
							localField: '_id',
							foreignField: '_id',
							as : 'vendedor'
						}
					},
					{
						$sort:{ total:-1}
					},
					{
						$limit: 10
					}
					], (error,resultado)=>{
						if(error) rejects(error)
							else resolve(resultado)
						})

				})
			},



		// ------------
	},
	Mutation: {

		// ----------------


		crearCliente: (root,{ input }) => {

			// creamos el objeto
			const nuevoCliente = new Clientes({
				nombre : input.nombre,
				apellido : input.apellido,
				empresa : input.empresa,
				emails : input.emails,
				edad : input.edad,
				tipo : input.tipo,
				pedidos : input.pedidos,
				VendedorID: input.VendedorID
			})
				// mongo agrege automaticamente un id
				nuevoCliente.id= nuevoCliente._id

				return new Promise((resolve,object)=>{
					nuevoCliente.save((error)=>{
						if (error)  rejects(error); 
						else resolve(nuevoCliente)
					})
				})

			},

			// {new:true} => si no existe crea uno nuevo
			actualizarCliente:(root,{ input }) => {
				return new Promise((resolve,object)=>{
					Clientes.findOneAndUpdate({ _id : input.id }, input, {new:true}, (error,cliente)=>{
						if (error) rejects(error)
							else resolve(cliente)
						})

				})

			},
			// 
			eliminarCliente:(root, { id })=>{
				return new Promise((resolve,object)=>{
					Clientes.findOneAndDelete({_id:id},(error)=>{
						if (error) rejects(error)
							else resolve("Se Eliminó el Cliente correctamente")
						})
				});
			},


			// ----------------PRODUCTOS-----
			nuevoProducto:(root,{input}) => {
				const nuevoProducto = new  Productos({
					nombre: input.nombre,
					precio: input.precio,
					stock : input.stock
				})
				
				// Mongo DB crea el ID que se asigna al objeto
				nuevoProducto.id = nuevoProducto._id

				return new Promise((resolve,object)=>{
					nuevoProducto.save((error)=>{
						if (error)  rejects(error); 
						else resolve(nuevoProducto)
					})
				})


			},

			 // {new:true} => si no existe crea uno nuevo
			 actualizarProducto:(root,{ input }) => {
			 	return new Promise((resolve,object)=>{
			 		Productos.findOneAndUpdate({ _id : input.id }, input, {new:true}, (error,producto)=>{
			 			if (error) rejects(error)
			 				else resolve(producto)
			 			})

			 	})

			 },

			 eliminarProducto:(root, { id })=>{
			 	return new Promise((resolve,object)=>{
			 		Productos.findOneAndDelete({_id:id},(error)=>{
			 			if (error) rejects(error)
			 				else resolve("Se Eliminó Producto correctamente")
			 			})
			 	});
			 },


			 nuevoPedido:(root,{input})=>{

			 	const nuevoPedido=new Pedidos({
			 		pedido:input.pedido,
			 		total: input.total,
			 		fecha: new Date(),
			 		cliente: input.cliente,
			 		estado:"PENDIENTE",
			 		vendedor:input.vendedor
			 	});

			 	nuevoPedido.id= nuevoPedido._id

			 	return new Promise((resolve,object)=>{

				 		// Para actualizar el Stock de la Tabla Productos
				 		input.pedido.forEach(pedido =>{
				 			Productos.updateOne({_id: pedido.id},
				 			{
				 				"$inc":
				 				{"stock": -pedido.cantidad}
				 			},function(error){
				 				if(error) return new Error(error)
				 			}
				 		)
				 		});
				 		// -----------------

				 		nuevoPedido.save((error)=>{
				 			if (error)  rejects(error); 
				 			else resolve(nuevoPedido)
				 		})
				 	});

			 },

			 actualizarEstado:(root, {input})=>{
			 	return new Promise((resolve,object)=>{

			 		// recorrer y actualizar la cantidad de productos en base
			 		// al estado del pedido

			 		const {estado} = input;
			 		let instruccion;
			 		if(estado === 'COMPLETADO'){
			 			instruccion='-';
			 		}else if(estado === 'CANCELADO'){
			 			instruccion='+';
			 		}

			 		input.pedido.forEach(pedido =>{
			 			Productos.updateOne({_id: pedido.id},
			 			{
			 				"$inc":
			 				{"stock": `${instruccion}${pedido.cantidad}`}
			 			},function(error){
			 				if(error) return new Error(error)
			 			}
			 		)
			 		});
				 		// -----------------

				 		Pedidos.findOneAndUpdate({_id:input.id}, input , {new:true} , (error)=>{
				 			if(error) rejects(error);
				 			else resolve('Se actualizó correctamente');
				 		})
				 	})
			 	
			 },

			 // usuario de tipo asincrono
			 crearUsuario: async(root, {usuario,nombre, password,rol}) => {

			 		// revisar si un usuario contiene este password
			 		const existeUsuario= await Usuarios.findOne({ usuario })

			 		if (existeUsuario) {
			 			throw new Error('El usuario  ya existe')
			 		}

			 		const nuevoUsuario = await new Usuarios({
			 			usuario,
			 			nombre,
			 			password,
			 			rol
			 		}).save();

			 		return "Usuario creado"


			 	},


			 	autenticarUsuario: async(root, {usuario, password}) => {
			 		const nombreUsuario= await Usuarios.findOne({usuario});

			 		if(!nombreUsuario){
			 			throw new Error('Usuario no encontrado');
			 		}

			 		const passwordCorrecto= await bcrypt.compare(password,nombreUsuario.password);

			 		if (!passwordCorrecto) {
			 			throw new Error('Password Incorrecto');
			 		}

			 		return {
			 			token: crearToken(nombreUsuario,process.env.SECRETO,'1hr')
			 		}
			 	}

			// -----------------------------------


		}
	}


