import { createYoga } from 'graphql-yoga';
import schema from '../src/schema';
import { createContext } from '../src/context';

const yoga = createYoga({
    schema,
    context: createContext,
    cors: {
        origin: process.env.CLIENT_URL || '*',
        credentials: true
    },
    graphiql: process.env.NODE_ENV === 'development'
});

export default yoga;
