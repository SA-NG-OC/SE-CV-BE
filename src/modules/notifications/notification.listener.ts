import { Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
@Injectable()
export class NotificationsListener {
  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('company.created')
  async handleCompanyCreated(payload: any) {
    const { userId, companyName } = payload;

    await Promise.all([
      this.notificationsService.createAndNotify({
        user_id: userId,
        title: 'Đăng ký công ty thành công',
        message: `Yêu cầu tạo công ty "${companyName}" đang chờ duyệt.`,
        type: 'COMPANY_CREATED',
      }),
      this.notificationsService.createAndNotifyToAdmin({
        title: 'Yêu cầu phê duyệt công ty mới',
        message: `Người dùng ${userId} vừa đăng ký công ty: ${companyName}`,
        type: 'ADMIN_REVIEW_REQUIRED',
      }),
    ]);
  }

  @OnEvent('company.statusChanged')
  async handleCompanyStatusChanged(payload: any) {
    const { companyId, companyName, newStatus } = payload;
    let message = '';
    if (newStatus === 'APPROVED') {
      message = `Công ty "${companyName}" của bạn đã được phê duyệt. Bạn có thể bắt đầu đăng tuyển dụng và quản lý công ty.`;
    } else if (newStatus === 'REJECTED') {
      message = `Rất tiếc, công ty "${companyName}" của bạn đã bị từ chối. Vui lòng kiểm tra lại thông tin và thử đăng ký lại.`;
    } else {
      message = `Trạng thái công ty "${companyName}" của bạn đã thay đổi thành ${newStatus}. Vui lòng kiểm tra chi tiết trong phần quản lý công ty.`;
    }
    const userId = await this.notificationsService.getCompanyUserId(companyId);
    await this.notificationsService.createAndNotify({
      user_id: userId,
      title: 'Cập nhật trạng thái công ty',
      message,
      type: 'COMPANY_STATUS_CHANGED',
    });
  }

  @OnEvent('job.created')
  async handleJobCreated() {
    await this.notificationsService.createAndNotifyToAdmin({
      title: 'Một tin tuyển dụng mới vừa được thêm!!',
      message: 'Một tin tuyển dụng mới đang chờ duyệt',
    });
  }

  @OnEvent('job.updated')
  async handleJobUpdated(payload: any) {
    const { jobTitle } = payload;
    await this.notificationsService.createAndNotifyToAdmin({
      title: 'Một tin tuyển dụng đã được cập nhật gần đây',
      message: `Tin tuyển dụng ${jobTitle} vừa được cập nhật`,
    });
  }

  @OnEvent('job.statusChanged')
  async handleChangeJobStatus(payload: {
    companyId: number | null;
    companyName: string;
    userId: number | null;
    jobTitle: string;
    newStatus: 'pending' | 'approved' | 'rejected' | 'restricted' | null;
  }) {
    try {
      const { companyId, companyName, userId, jobTitle, newStatus } = payload;

      if (!companyId || !userId) {
        console.warn(
          '[NotificationListener]: Missing companyId or userId',
          payload,
        );
        return;
      }

      let messageFollower = '';
      let messageCompany = '';

      if (newStatus === 'approved') {
        messageCompany = `Tin tuyển dụng "${jobTitle}" của bạn đã được phê duyệt.`;

        messageFollower = `Công ty mà bạn đang theo dõi ${companyName} vừa đăng tin tuyển dụng mới: ${jobTitle}`;

        await this.notificationsService.notifyToFollowers(companyId, {
          title: 'Tin tuyển dụng mới mà bạn có thể thích',
          message: messageFollower,
        });
      } else if (newStatus === 'rejected') {
        messageCompany = `Rất tiếc, tin tuyển dụng "${jobTitle}" của bạn đã bị từ chối. Vui lòng kiểm tra lại thông tin và thử lại.`;
      } else {
        messageCompany = `Trạng thái tin tuyển dụng "${jobTitle}" của bạn đã thay đổi thành ${newStatus}.`;
      }

      await this.notificationsService.createAndNotify({
        user_id: userId,
        title: 'Cập nhật trạng thái tin tuyển dụng',
        message: messageCompany,
        type: 'JOB_COMPANY_STATUS_CHANGED',
      });
    } catch (error) {
      console.error('[NotificationListener Error]', {
        error,
        payload,
      });
    }
  }
}
