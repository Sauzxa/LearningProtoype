import { Injectable } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class LiveKitService {
  private apiKey: string;
  private apiSecret: string;
  private livekitUrl: string;

  constructor() {
    this.apiKey = process.env.LIVEKIT_API_KEY!;
    this.apiSecret = process.env.LIVEKIT_API_SECRET!;
    this.livekitUrl = process.env.LIVEKIT_URL!;
    
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.apiKey || !this.apiSecret || !this.livekitUrl) {
      throw new Error('Missing required LiveKit environment variables: LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL');
    }
  }

  async generateToken(
    roomName: string,
    participantName: string,
    role: 'publisher' | 'viewer'
  ): Promise<{ token: string; identity: string; url: string }> {
    const identity = participantName || this.generateIdentity();
    
    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity,
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: role === 'publisher',
      canSubscribe: true,
      canPublishData: true,
    });

    return {
      token: await at.toJwt(),
      identity,
      url: this.livekitUrl,
    };
  }

  private generateIdentity(): string {
    return `user_${Math.random().toString(36).substring(2, 11)}`;
  }
}
