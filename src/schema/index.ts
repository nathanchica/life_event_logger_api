import { join } from 'path';

import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { DateTimeISOTypeDefinition, DateTimeISOResolver } from 'graphql-scalars';

import eventLabelResolvers from './eventLabel';
import loggableEventResolvers from './loggableEvent';
import userResolvers from './user';

const typesArray = loadFilesSync(join(__dirname, './**/*.graphql'));

export const typeDefs = mergeTypeDefs([DateTimeISOTypeDefinition, ...typesArray]);
export const resolvers = mergeResolvers([
    {
        DateTime: DateTimeISOResolver
    },
    userResolvers,
    loggableEventResolvers,
    eventLabelResolvers
]);

const schema = makeExecutableSchema({
    typeDefs,
    resolvers
});

export default schema;
