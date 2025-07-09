import { prisma } from './prisma/client';
import { verifyGoogleToken } from './auth/verifyToken';

type RequestWithHeaders = {
    headers: {
        get: (key: string) => string | null;
    };
};

export async function createContext({ request }: { request: RequestWithHeaders }) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
        return { user: null, prisma };
    }

    const googleUser = await verifyGoogleToken(token);
    if (!googleUser || !googleUser.sub || !googleUser.email || !googleUser.name) {
        return { user: null, prisma };
    }

    const user = await prisma.user.upsert({
        where: { googleId: googleUser.sub },
        update: {
            name: googleUser.name
        },
        create: {
            googleId: googleUser.sub,
            email: googleUser.email,
            name: googleUser.name
        }
    });

    return { user, prisma };
}
