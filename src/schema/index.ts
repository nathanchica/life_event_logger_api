import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { GraphQLScalarType, Kind } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { join } from 'path';

import userResolvers from './user/resolvers';
import loggableEventResolvers from './loggableEvent/resolvers';

const DateTimeScalar = new GraphQLScalarType({
    name: 'DateTime',
    description: 'ISO 8601 compliant date-time scalar',
    serialize: (value: any) => {
        if (value instanceof Date) {
            return value.toISOString();
        }
        return new Date(value).toISOString();
    },
    parseValue: (value: any) => {
        return new Date(value);
    },
    parseLiteral: (ast) => {
        if (ast.kind === Kind.STRING) {
            return new Date(ast.value);
        }
        return null;
    }
});

const typesArray = loadFilesSync(join(__dirname, './**/*.graphql'));

export const typeDefs = mergeTypeDefs(typesArray);
export const resolvers = mergeResolvers([
    {
        DateTime: DateTimeScalar
    },
    userResolvers,
    loggableEventResolvers
]);

const schema = makeExecutableSchema({
    typeDefs,
    resolvers
});

export default schema;
