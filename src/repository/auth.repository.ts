import prisma from '@/lib/prisma';

export class AuthRepository {
  static async validateUser(email: string) {
    return prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
      include: {
        department: true,
      },
    });
  }
}
