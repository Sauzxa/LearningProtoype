import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { LiveKitService } from './livekit.service';

@Controller('livekit')
export class LiveKitController {
  constructor(private readonly liveKitService: LiveKitService) {}

  @Get('token')
  async getToken(
    @Query('roomName') roomName: string,
    @Query('participantName') participantName?: string,
    @Query('role') role?: 'publisher' | 'viewer',
  ) {
    if (!roomName) {
      throw new BadRequestException('roomName is required');
    }

    const effectiveRole = role || 'viewer';

    return this.liveKitService.generateToken(
      roomName,
      participantName || '',
      effectiveRole,
    );
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
