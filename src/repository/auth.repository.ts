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

  static async findActiveUserById(id: number) {
    return prisma.user.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        department: true,
      },
    });
  }
}
