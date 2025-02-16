import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { IntegrationService } from "../integration.service";
import { UsersService } from "src/features/users/application/users.service";
export class SendNotifyEvent {
  constructor(
    public readonly title: string,
    public readonly userIds: string[],
  ) { }
}
@EventsHandler(SendNotifyEvent)
export class SendNotifyHandler implements IEventHandler<SendNotifyEvent> {
  constructor(
    private readonly integrationService: IntegrationService,
    private readonly usersService: UsersService
  ) { }

  async handle(event: SendNotifyEvent) {
    const message = `Новый пост: ${event.title}`;
    const ids = await this.usersService.getUsersByIds(event.userIds)
    await this.integrationService.sendNotification(message, ids);
  }
}