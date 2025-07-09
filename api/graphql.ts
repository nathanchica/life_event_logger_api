import { createYoga } from 'graphql-yoga';

import { createContext } from '../src/context';
import schema from '../src/schema';

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
