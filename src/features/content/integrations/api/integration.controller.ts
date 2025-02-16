import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/features/auth/guards/jwt-auth.guard';
import { UsersService } from 'src/features/users/application/users.service';
import { IntegrationService } from '../applications/integration.service';

@ApiTags('Integrations')
@Controller('integrations/telegram')
export class IntegrationsController {
  constructor(

    private usersService: UsersService,
    private integrationService: IntegrationService
  ) { }

  @UseGuards(JwtAuthGuard)
  @Get('auth-bot-link')
  async getAuthLink(
    @Req() req
  ) {
    const userId = req?.user?.userId
    return await this.integrationService.getLink(userId)
  }

  @Post('/bind')
  @HttpCode(204)
  async webhook(
    @Body() ids: { id: string, tgId: string }
  ) {
    try {
      const user = await this.usersService.getById(ids.id)
      if (!user) return
      user.tgId = ids.tgId
      await this.usersService.saveModel(user)
    } catch {
      return "Оч жаль, но что-то пошло не так"
    }
  }
}
