import { importSchema } from 'graphql-import';

const typeDefs = importSchema('data/schema.graphql');

// import {typeDefs} from './schemaGraphql'
export { typeDefs };

