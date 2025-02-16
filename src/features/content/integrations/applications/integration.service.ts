import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscribeBlog, SubscribeStatus } from '../domain/integration.entity';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class IntegrationService {
  tgUrl: string
  tgName: string
  tgApi: string
  tgToken: string
  constructor(
    private configService: ConfigService,
    @InjectRepository(SubscribeBlog)
    private readonly subscribeBlogRepo: Repository<SubscribeBlog>,
  ) {
    this.tgUrl = this.configService.get<string>('TG_BOT')
    this.tgApi = this.configService.get<string>('TG_API')
    this.tgName = this.configService.get<string>('TG_NAME')
    this.tgToken = this.configService.get<string>('TG_TOKEN')
  }

  async create(
    blogId: string,
    userId: string
  ): Promise<SubscribeBlog> {
    const hasSubscription = await this.subscribeBlogRepo.findOneBy({ blogId, userId });
    console.log(hasSubscription)
    if (hasSubscription) throw new NotFoundException()
    const subscription = await this.subscribeBlogRepo.create({ blogId, userId, status: SubscribeStatus.Subscribed });
    await this.subscribeBlogRepo.save(subscription)
    console.log(subscription, 'createdSubscription')
    return subscription;
  }

  async delete(
    blogId: string,
    userId: string
  ): Promise<void> {
    await this.subscribeBlogRepo.update({ blogId, userId }, { status: SubscribeStatus.Unsubscribed });
  }

  async getLink(
    userId: string,
  ): Promise<{ link: string }> {
    return { link: `${this.tgUrl}?start=${userId}` }
  }

  async sendNotification(message: string, tgIds: string[]) {
    for (const tgId of tgIds) {
      const link = `${this.tgApi}/bot${this.tgToken}/sendMessage`
      console.log(link)
      console.log(message)
      try {
        await axios.post(link, {
          chat_id: tgId,
          text: message,
          parse_mode: 'Markdown',
        });
      } catch (error) {
        console.error(`Ошибка отправки сообщения пользователю ${tgId}:`, error.message);
      }
    }
  }
}
