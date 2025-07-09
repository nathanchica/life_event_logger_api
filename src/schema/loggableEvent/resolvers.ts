import { z } from 'zod';

const CreateLoggableEventSchema = z.object({
    name: z.string().min(1, 'Name is required').max(25, 'Name must be under 25 characters'),
    labelIds: z.array(z.string()).optional()
});

const UpdateLoggableEventSchema = z.object({
    id: z.string().min(1, 'ID is required'),
    name: z.string().min(1, 'Name is required').max(25, 'Name must be under 25 characters').optional()
});

const DeleteLoggableEventSchema = z.object({
    id: z.string().min(1, 'ID is required')
});

function formatZodError(error: z.ZodError) {
    return error.errors.map((err) => ({
        code: 'VALIDATION_ERROR',
        field: err.path.join('.'),
        message: err.message
    }));
}

const resolvers = {
    Query: {
        loggableEventsForUser: async (_: any, __: any, { user, prisma }: any) => {
            if (!user) throw new Error('Not authenticated');

            return prisma.loggableEvent.findMany({
                where: { userId: user.id },
                include: { labels: true }
            });
        }
    },

    Mutation: {
        createLoggableEvent: async (_: any, { input }: any, { user, prisma }: any) => {
            if (!user) {
                return {
                    loggableEvent: null,
                    errors: [{ code: 'UNAUTHORIZED', field: null, message: 'Not authenticated' }]
                };
            }

            try {
                const validatedInput = CreateLoggableEventSchema.parse(input);

                const event = await prisma.loggableEvent.create({
                    data: {
                        name: validatedInput.name,
                        userId: user.id,
                        dateTimeRecords: [],
                        labels: validatedInput.labelIds
                            ? {
                                  connect: validatedInput.labelIds.map((id) => ({ id }))
                              }
                            : undefined
                    },
                    include: { labels: true }
                });

                return {
                    loggableEvent: event,
                    errors: []
                };
            } catch (error) {
                if (error instanceof z.ZodError) {
                    return {
                        loggableEvent: null,
                        errors: formatZodError(error)
                    };
                }

                return {
                    loggableEvent: null,
                    errors: [{ code: 'INTERNAL_ERROR', field: null, message: 'Something went wrong' }]
                };
            }
        },

        updateLoggableEvent: async (_: any, { input }: any, { user, prisma }: any) => {
            if (!user) {
                return {
                    loggableEvent: null,
                    errors: [{ code: 'UNAUTHORIZED', field: null, message: 'Not authenticated' }]
                };
            }

            try {
                const validatedInput = UpdateLoggableEventSchema.parse(input);

                const updateData: any = {};
                if (validatedInput.name) {
                    updateData.name = validatedInput.name;
                }

                const event = await prisma.loggableEvent.update({
                    where: { id: validatedInput.id, userId: user.id },
                    data: updateData,
                    include: { labels: true }
                });

                return {
                    loggableEvent: event,
                    errors: []
                };
            } catch (error) {
                if (error instanceof z.ZodError) {
                    return {
                        loggableEvent: null,
                        errors: formatZodError(error)
                    };
                }

                return {
                    loggableEvent: null,
                    errors: [{ code: 'INTERNAL_ERROR', field: null, message: 'Something went wrong' }]
                };
            }
        },

        deleteLoggableEvent: async (_: any, { input }: any, { user, prisma }: any) => {
            if (!user) {
                return {
                    loggableEvent: null,
                    errors: [{ code: 'UNAUTHORIZED', field: null, message: 'Not authenticated' }]
                };
            }

            try {
                const validatedInput = DeleteLoggableEventSchema.parse(input);

                const event = await prisma.loggableEvent.delete({
                    where: { id: validatedInput.id, userId: user.id },
                    include: { labels: true }
                });

                return {
                    loggableEvent: event,
                    errors: []
                };
            } catch (error) {
                if (error instanceof z.ZodError) {
                    return {
                        loggableEvent: null,
                        errors: formatZodError(error)
                    };
                }

                return {
                    loggableEvent: null,
                    errors: [{ code: 'INTERNAL_ERROR', field: null, message: 'Something went wrong' }]
                };
            }
        }
    },

    LoggableEvent: {
        user: async (parent: any, _: any, { prisma }: any) => {
            return prisma.user.findUnique({
                where: { id: parent.userId }
            });
        },
        labels: async (parent: any, _: any, { prisma }: any) => {
            return prisma.eventLabel.findMany({
                where: {
                    loggableEvents: {
                        some: { id: parent.id }
                    }
                }
            });
        }
    }
};

export default resolvers;
