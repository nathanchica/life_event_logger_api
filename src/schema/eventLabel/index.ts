import { z } from 'zod';

import { GraphQLContext } from '../../context';
import { Resolvers } from '../../generated/graphql';
import { UserParent } from '../user';

export type EventLabelParent = {
    id?: string;
    name?: string;
    user?: UserParent;
    createdAt?: Date;
    updatedAt?: Date;
};

const CreateEventLabelSchema = z.object({
    name: z.string().min(1, 'Name cannot be empty').max(25, 'Name must be under 25 characters')
});

const UpdateEventLabelSchema = z.object({
    id: z.string().min(1, 'ID is required'),
    name: z.string().min(1, 'Name cannot be empty').max(25, 'Name must be under 25 characters').optional()
});

const DeleteEventLabelSchema = z.object({
    id: z.string().min(1, 'ID is required')
});

function formatZodError(error: z.ZodError) {
    return error.errors.map((err) => ({
        code: 'VALIDATION_ERROR',
        field: err.path.join('.'),
        message: err.message
    }));
}

const resolvers: Resolvers<GraphQLContext> = {
    Query: {
        eventLabelsForUser: async (_, { userId }, { user, prisma }) => {
            if (!user) throw new Error('Not authenticated');

            return prisma.eventLabel.findMany({
                where: { userId }
            });
        }
    },

    Mutation: {
        createEventLabel: async (_, { input }, { user, prisma }) => {
            if (!user) {
                return {
                    eventLabel: null,
                    errors: [{ code: 'UNAUTHORIZED', field: null, message: 'Not authenticated' }]
                };
            }

            try {
                const validatedInput = CreateEventLabelSchema.parse(input);

                const label = await prisma.eventLabel.create({
                    data: {
                        name: validatedInput.name,
                        userId: user.id
                    }
                });

                return {
                    eventLabel: label,
                    errors: []
                };
            } catch (error) {
                if (error instanceof z.ZodError) {
                    return {
                        eventLabel: null,
                        errors: formatZodError(error)
                    };
                }

                return {
                    eventLabel: null,
                    errors: [{ code: 'INTERNAL_ERROR', field: null, message: 'Something went wrong' }]
                };
            }
        },

        updateEventLabel: async (_, { input }, { user, prisma }) => {
            if (!user) {
                return {
                    eventLabel: null,
                    errors: [{ code: 'UNAUTHORIZED', field: null, message: 'Not authenticated' }]
                };
            }

            try {
                const validatedInput = UpdateEventLabelSchema.parse(input);

                const updateData: { name?: string } = {};
                if (validatedInput.name) {
                    updateData.name = validatedInput.name;
                }

                const label = await prisma.eventLabel.update({
                    where: { id: validatedInput.id, userId: user.id },
                    data: updateData
                });

                return {
                    eventLabel: label,
                    errors: []
                };
            } catch (error) {
                if (error instanceof z.ZodError) {
                    return {
                        eventLabel: null,
                        errors: formatZodError(error)
                    };
                }

                return {
                    eventLabel: null,
                    errors: [{ code: 'INTERNAL_ERROR', field: null, message: 'Something went wrong' }]
                };
            }
        },

        deleteEventLabel: async (_, { input }, { user, prisma }) => {
            if (!user) {
                return {
                    eventLabel: null,
                    errors: [{ code: 'UNAUTHORIZED', field: null, message: 'Not authenticated' }]
                };
            }

            try {
                const validatedInput = DeleteEventLabelSchema.parse(input);

                const label = await prisma.eventLabel.delete({
                    where: { id: validatedInput.id, userId: user.id }
                });

                return {
                    eventLabel: label,
                    errors: []
                };
            } catch (error) {
                if (error instanceof z.ZodError) {
                    return {
                        eventLabel: null,
                        errors: formatZodError(error)
                    };
                }

                return {
                    eventLabel: null,
                    errors: [{ code: 'INTERNAL_ERROR', field: null, message: 'Something went wrong' }]
                };
            }
        }
    },

    EventLabel: {
        user: async (parent, _, { prisma }) => {
            const user = await prisma.user.findUnique({
                where: { id: parent.userId }
            });
            if (!user) {
                throw new Error(`User not found for EventLabel ${parent.id}`);
            }
            return user;
        }
    }
};

export default resolvers;
