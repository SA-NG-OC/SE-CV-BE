import { userInfo } from "os";

userInfo.update(id, { status: hhaha }})

userInfo.delete(id);

userInfo.find({
    select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
    },
    where: [
        { status: 'active' },
        { balance: MoreThan(1000) }
    ],
    order: { status: 'DESC' }
})

orderRepo
    .createQueryBuilder('order')
    .innerJoinAndSelect('order.user', 'user')
    .where('order.status = :status', { status: OrderStatus.DELIVERED })
    .getMany()