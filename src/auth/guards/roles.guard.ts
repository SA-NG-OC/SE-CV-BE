import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { ForbiddenException } from "@nestjs/common";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {

    }
    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<number[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        console.log('USER:', user);
        console.log('REQUIRED ROLES:', requiredRoles);
        if (!user || !requiredRoles.includes(user.roleId)) {
            throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
        }
        return true;
    }
}