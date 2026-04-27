import { Module } from '@nestjs/common';
import { LiveKitModule } from './livekit/livekit.module';

@Module({
  imports: [LiveKitModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
