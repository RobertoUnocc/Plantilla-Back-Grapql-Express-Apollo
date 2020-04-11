import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import {typeDefs} from './data/schema';
import {resolvers } from './data/resolvers.js';

// AUTENTICAR

const app = express();

const server = new ApolloServer({ 
	typeDefs, 
	resolvers
});

// conectamos Apollo Server con Express
server.applyMiddleware({ app });

app.listen({ port: 8000 }, () => console.log(`Server on port http://localhost:8000${server.graphqlPath}`));

// https://github.com/MigueMartelo/React-GraphQL-Apollo-servidor/blob/master/data/resolvers.js


// Al usar Apollo usaremos una nueva grafica ya no GraphiQl sino el de APollo

















// SI lo autenticas hacer esto
// Autenticar

/*
import dotenv from 'dotenv';
dotenv.config({path:'variables.env'})

import jwt from 'jsonwebtoken';


const app = express();
// context comunica el cliente a servidor
const server = new ApolloServer({ 
	typeDefs, 
	resolvers
	context : async({req})=>{
		// obtener una respuesta del cliente,  en este caso el token
		const token = req.headers['authorization'];

		console.log(token)
		if (token !== "null") {
			try{
				// verificamos el token del FronEnd(cliente)
				const usuarioActual= await jwt.verify(token,process.env.SECRETO);

				// agregamos el usuario actual al request
				// console.log(usuarioActual)

				req.usuarioActual=usuarioActual;
				return {
					usuarioActual
				}

				
			}catch(error){
				// console.log(error)
			}
		}
	}
});
*/