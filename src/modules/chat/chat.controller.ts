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
    UseInterceptors,
    UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';
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
import { GetConversationsQueryDto } from './dto/get-conversations-query.dto';
import {
    GetConversationsDocs,
    GetMessagesDocs,
    GetOrCreateConversationDocs,
    MarkReadDocs,
    SendMessageDocs,
    SetBlockedDocs,
    SetHiddenDocs,
} from './decorators';

@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly chatGateway: ChatGateway,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    // =========================================================================
    // GET OR CREATE CONVERSATION
    // Không cần emit socket — chỉ trả về data, client tự join conversation sau
    // =========================================================================

    @Post('conversation')
    @GetOrCreateConversationDocs()
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
    // HTTP dùng khi có ảnh (multipart/form-data) — upload Cloudinary → lưu DB → broadcast
    // Text thuần nên dùng WS 'send_message' cho nhanh hơn
    // =========================================================================

    @Post('message')
    @SendMessageDocs()
    @Roles(Role.COMPANY, Role.STUDENT)
    @UseInterceptors(FilesInterceptor('images', 10))
    async sendMessage(
        @Req() req,
        @Body() dto: SendMessageDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        const senderId: number = req.user.userId;

        const image_urls = files?.length
            ? await Promise.all(
                files.map(f => this.cloudinaryService.uploadImage(f).then(r => r.secure_url))
            )
            : [];

        const { message, recipientUserIds } = await this.chatService.sendMessage(
            dto.conversationId,
            senderId,
            dto.content,
            image_urls,
        );

        // Dùng broadcast method của gateway — không duplicate logic emit
        this.chatGateway.broadcastMessage(
            senderId,
            recipientUserIds,
            dto.conversationId,
            message,
        );

        return new ResponseSuccess('Gửi tin nhắn thành công', { message });
    }

    // =========================================================================
    // GET MESSAGES (cursor pagination)
    // =========================================================================

    @Get('conversation/:id/messages')
    @GetMessagesDocs()
    @Roles(Role.COMPANY, Role.STUDENT)
    async getMessages(
        @Req() req,
        @Param('id', ParseIntPipe) conversationId: number,
        @Query() dto: GetMessagesDto,
    ) {
        const userId: number = req.user.userId;
        const result = await this.chatService.getMessages(conversationId, userId, dto);
        return new ResponseSuccess('Lấy tin nhắn thành công', result);
    }

    // =========================================================================
    // CONVERSATION LIST
    // =========================================================================

    @Get('conversations')
    @GetConversationsDocs()
    @Roles(Role.COMPANY, Role.STUDENT)
    async getConversations(
        @Req() req,
        @Query() query: GetConversationsQueryDto,
    ) {
        const userId: number = req.user.userId;
        const roleId: number = req.user.roleId;
        const result = await this.chatService.getConversations(userId, roleId, query);
        return new ResponseSuccess('Lấy danh sách hội thoại thành công', result);
    }

    // =========================================================================
    // MARK READ
    // Sau khi lưu DB → broadcast read_receipt để cả hai phía cập nhật tick xanh
    // =========================================================================

    @Patch('read')
    @MarkReadDocs()
    @Roles(Role.COMPANY, Role.STUDENT)
    async markRead(
        @Req() req,
        @Body() dto: MarkReadDto,
    ) {
        const userId: number = req.user.userId;
        await this.chatService.markRead(userId, dto);

        // Broadcast để người kia cập nhật tick xanh real-time
        this.chatGateway.broadcastReadReceipt(userId, dto.conversationId, dto.messageId);

        return new ResponseSuccess('Đã đánh dấu đã đọc', {});
    }

    // =========================================================================
    // HIDE CONVERSATION
    // Hidden chỉ ảnh hưởng bản thân → broadcast về user room của chính mình
    // (sync đa thiết bị nếu user đăng nhập nhiều nơi)
    // =========================================================================

    @Patch('hidden')
    @SetHiddenDocs()
    @Roles(Role.COMPANY, Role.STUDENT)
    async setHidden(
        @Req() req,
        @Body() dto: SetHiddenDto,
    ) {
        const userId: number = req.user.userId;
        const result = await this.chatService.setHidden(userId, dto);

        this.chatGateway.broadcastHidden(userId, result);

        return new ResponseSuccess('Cập nhật trạng thái ẩn thành công', result);
    }

    // =========================================================================
    // BLOCK / UNBLOCK CONVERSATION
    // Block ảnh hưởng cả hai phía:
    //   - Người block → nhận 'blocked_updated' (confirm)
    //   - Người bị block → nhận 'you_were_blocked' hoặc 'you_were_unblocked'
    //     để disable/enable ô nhập tin nhắn real-time
    // =========================================================================

    @Patch('blocked')
    @SetBlockedDocs()
    @Roles(Role.COMPANY, Role.STUDENT)
    async setBlocked(
        @Req() req,
        @Body() dto: SetBlockedDto,
    ) {
        const actorId: number = req.user.userId;

        // Service cần trả về cả targetUserId để gateway biết notify ai
        const { result, targetUserId } = await this.chatService.setBlocked(actorId, dto);

        this.chatGateway.broadcastBlocked(actorId, targetUserId, dto.conversationId, dto.blocked, result);

        return new ResponseSuccess('Cập nhật trạng thái chặn thành công', result);
    }
}