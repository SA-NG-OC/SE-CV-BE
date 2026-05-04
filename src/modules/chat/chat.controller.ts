import {
    Body,
    Controller,
    Post,
    Get,
    Patch,
    Req,
    Param,
    ParseIntPipe,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/common/types/role.enum';

import {
    GetOrCreateConversationDto,
    SendMessageDto,
    GetMessagesDto,
    MarkReadDto,
    SetHiddenDto,
    SetBlockedDto,
} from './dto/chat.dto';

import ResponseSuccess from 'src/common/types/response-success';

@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    // =========================================================================
    // GET OR CREATE CONVERSATION
    // =========================================================================
    @Post('conversation')
    @Roles(Role.COMPANY, Role.STUDENT)
    @HttpCode(HttpStatus.OK)
    async getOrCreateConversation(
        @Body() dto: GetOrCreateConversationDto,
    ) {

        const result = await this.chatService.getOrCreateConversation(
            dto.companyId,
            dto.studentId,
        );

        return new ResponseSuccess('Thành công', result);
    }

    // =========================================================================
    // SEND MESSAGE
    // =========================================================================
    @Post('message')
    @Roles(Role.COMPANY, Role.STUDENT)
    async sendMessage(
        @Req() req,
        @Body() dto: SendMessageDto,
    ) {
        const senderId = req.user.userId;

        const result = await this.chatService.sendMessage(
            dto.conversationId,
            senderId,
            dto.content,
        );

        return new ResponseSuccess('Gửi tin nhắn thành công', result);
    }

    // =========================================================================
    // GET MESSAGES (pagination bằng cursor)
    // =========================================================================
    @Get('conversation/:id/messages')
    @Roles(Role.COMPANY, Role.STUDENT)
    async getMessages(
        @Req() req,
        @Param('id', ParseIntPipe) conversationId: number,
        @Query() dto: GetMessagesDto,
    ) {
        const userId = req.user.userId;

        const result = await this.chatService.getMessages(
            conversationId,
            userId,
            dto,
        );

        return new ResponseSuccess('Lấy tin nhắn thành công', result);
    }

    // =========================================================================
    // CONVERSATION LIST
    // =========================================================================
    @Get('conversations')
    @Roles(Role.COMPANY, Role.STUDENT)
    async getConversations(@Req() req) {
        const userId = req.user.userId;
        const roleId = req.user.roleId;

        const result = await this.chatService.getConversations(
            userId,
            roleId,
        );

        return new ResponseSuccess('Lấy danh sách hội thoại thành công', result);
    }

    // =========================================================================
    // MARK READ
    // =========================================================================
    @Patch('read')
    @Roles(Role.COMPANY, Role.STUDENT)
    async markRead(
        @Req() req,
        @Body() dto: MarkReadDto,
    ) {
        const userId = req.user.userId;

        await this.chatService.markRead(userId, dto);

        return new ResponseSuccess('Đã đánh dấu đã đọc', {});
    }

    // =========================================================================
    // HIDE CONVERSATION
    // =========================================================================
    @Patch('hidden')
    @Roles(Role.COMPANY, Role.STUDENT)
    async setHidden(
        @Req() req,
        @Body() dto: SetHiddenDto,
    ) {
        const userId = req.user.userId;

        const result = await this.chatService.setHidden(userId, dto);

        return new ResponseSuccess('Cập nhật trạng thái ẩn thành công', result);
    }

    // =========================================================================
    // BLOCK CONVERSATION
    // =========================================================================
    @Patch('blocked')
    @Roles(Role.COMPANY, Role.STUDENT)
    async setBlocked(
        @Req() req,
        @Body() dto: SetBlockedDto,
    ) {
        const userId = req.user.userId;

        const result = await this.chatService.setBlocked(userId, dto);

        return new ResponseSuccess('Cập nhật trạng thái chặn thành công', result);
    }
}