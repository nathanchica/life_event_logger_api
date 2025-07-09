const resolvers = {
    Query: {
        user: async (_: any, __: any, { user }: any) => {
            return user;
        }
    },

    User: {
        loggableEvents: async (parent: any, _: any, { prisma }: any) => {
            return prisma.loggableEvent.findMany({
                where: { userId: parent.id },
                include: { labels: true }
            });
        }
    }
};

export default resolvers;
