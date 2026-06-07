import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class UserRepository {
  static async findAll() {
    return prisma.user.findMany({
      where: {
        isActive: true,
      },
      include: {
        department: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  static async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        department: true,
      },
    });
  }

  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        department: true,
      },
    });
  }

  static async create(data: Omit<Prisma.UserUncheckedCreateInput, 'id' | 'isActive'>) {
    return prisma.user.create({
      data: {
        ...data,
        isActive: true,
      },
      include: {
        department: true,
      },
    });
  }

  static async update(id: number, data: Prisma.UserUncheckedUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        department: true,
      },
    });
  }

  static async delete(id: number, softDelete = true) {
    if (softDelete) {
      return prisma.user.update({
        where: { id },
        data: { isActive: false },
      });
    }
    return prisma.user.delete({
      where: { id },
    });
  }
}
