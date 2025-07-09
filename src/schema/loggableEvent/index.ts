import { z } from 'zod';

import { Resolvers } from '../../generated/graphql';
import { UserParent } from '../user';

export type LoggableEventParent = {
    id?: string;
    name?: string;
    dateTimeRecords?: Array<Date>;
    warningThresholdInDays?: number;
    user?: UserParent;
    createdAt?: Date;
    updatedAt?: Date;
};

const CreateLoggableEventSchema = z.object({
    name: z.string().min(1, 'Name cannot be empty').max(25, 'Name must be under 25 characters'),
    warningThresholdInDays: z.number().int().min(0, 'Warning threshold must be a positive number'),
    labelIds: z.array(z.string()).optional()
});

const UpdateLoggableEventSchema = z.object({
    id: z.string().min(1, 'ID is required'),
    name: z.string().min(1, 'Name cannot be empty').max(25, 'Name must be under 25 characters').optional(),
    warningThresholdInDays: z.number().int().min(0, 'Warning threshold must be a positive number').optional()
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

const resolvers: Resolvers = {
    Query: {
        loggableEventsForUser: async (_, __, { user, prisma }) => {
            if (!user) throw new Error('Not authenticated');

            return prisma.loggableEvent.findMany({
                where: { userId: user.id },
                include: { labels: true }
            });
        }
    },

    Mutation: {
        createLoggableEvent: async (_, { input }, { user, prisma }) => {
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
                        warningThresholdInDays: validatedInput.warningThresholdInDays,
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

        updateLoggableEvent: async (_, { input }, { user, prisma }) => {
            if (!user) {
                return {
                    loggableEvent: null,
                    errors: [{ code: 'UNAUTHORIZED', field: null, message: 'Not authenticated' }]
                };
            }

            try {
                const validatedInput = UpdateLoggableEventSchema.parse(input);

                const existingEvent = await prisma.loggableEvent.findUnique({
                    where: { id: validatedInput.id }
                });

                if (!existingEvent) {
                    return {
                        loggableEvent: null,
                        errors: [{ code: 'NOT_FOUND', field: 'id', message: 'Loggable event not found' }]
                    };
                }

                if (existingEvent.userId !== user.id) {
                    return {
                        loggableEvent: null,
                        errors: [
                            {
                                code: 'FORBIDDEN',
                                field: null,
                                message: 'You do not have permission to update this loggable event'
                            }
                        ]
                    };
                }

                const event = await prisma.loggableEvent.update({
                    where: { id: validatedInput.id },
                    data: {
                        ...(validatedInput.name ? { name: validatedInput.name } : {}),
                        ...(validatedInput.warningThresholdInDays !== undefined
                            ? { warningThresholdInDays: validatedInput.warningThresholdInDays }
                            : {})
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

        deleteLoggableEvent: async (_, { input }, { user, prisma }) => {
            if (!user) {
                return {
                    loggableEvent: null,
                    errors: [{ code: 'UNAUTHORIZED', field: null, message: 'Not authenticated' }]
                };
            }

            try {
                const validatedInput = DeleteLoggableEventSchema.parse(input);

                const existingEvent = await prisma.loggableEvent.findUnique({
                    where: { id: validatedInput.id }
                });

                if (!existingEvent) {
                    return {
                        loggableEvent: null,
                        errors: [{ code: 'NOT_FOUND', field: 'id', message: 'Loggable event not found' }]
                    };
                }

                if (existingEvent.userId !== user.id) {
                    return {
                        loggableEvent: null,
                        errors: [
                            {
                                code: 'FORBIDDEN',
                                field: null,
                                message: 'You do not have permission to delete this loggable event'
                            }
                        ]
                    };
                }

                const event = await prisma.loggableEvent.delete({
                    where: { id: validatedInput.id },
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
        user: async (parent, _, { prisma }) => {
            const user = await prisma.user.findUnique({
                where: { id: parent.userId }
            });
            if (!user) {
                throw new Error(`User not found for LoggableEvent ${parent.id}`);
            }
            return user;
        },
        labels: async (parent, _, { prisma }) => {
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
