import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { LiveKitController } from './livekit.controller';
import { LiveKitService } from './livekit.service';

describe('LiveKitController', () => {
  let controller: LiveKitController;
  let service: LiveKitService;

  const mockLiveKitService = {
    generateToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiveKitController],
      providers: [
        {
          provide: LiveKitService,
          useValue: mockLiveKitService,
        },
      ],
    }).compile();

    controller = module.get<LiveKitController>(LiveKitController);
    service = module.get<LiveKitService>(LiveKitService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getToken', () => {
    it('should return token when roomName is provided', async () => {
      const mockResponse = {
        token: 'mock-token',
        identity: 'user_123',
        url: 'ws://localhost:7880',
      };
      mockLiveKitService.generateToken.mockResolvedValue(mockResponse);

      const result = await controller.getToken('test-room');

      expect(result).toEqual(mockResponse);
      expect(service.generateToken).toHaveBeenCalledWith('test-room', '', 'viewer');
    });

    it('should throw BadRequestException when roomName is missing', async () => {
      await expect(controller.getToken('')).rejects.toThrow(BadRequestException);
      await expect(controller.getToken(undefined as any)).rejects.toThrow(BadRequestException);
    });

    it('should use provided participantName', async () => {
      const mockResponse = {
        token: 'mock-token',
        identity: 'john',
        url: 'ws://localhost:7880',
      };
      mockLiveKitService.generateToken.mockResolvedValue(mockResponse);

      await controller.getToken('test-room', 'john');

      expect(service.generateToken).toHaveBeenCalledWith('test-room', 'john', 'viewer');
    });

    it('should default role to viewer when not provided', async () => {
      const mockResponse = {
        token: 'mock-token',
        identity: 'user_123',
        url: 'ws://localhost:7880',
      };
      mockLiveKitService.generateToken.mockResolvedValue(mockResponse);

      await controller.getToken('test-room');

      expect(service.generateToken).toHaveBeenCalledWith('test-room', '', 'viewer');
    });

    it('should use publisher role when specified', async () => {
      const mockResponse = {
        token: 'mock-token',
        identity: 'user_123',
        url: 'ws://localhost:7880',
      };
      mockLiveKitService.generateToken.mockResolvedValue(mockResponse);

      await controller.getToken('test-room', undefined, 'publisher');

      expect(service.generateToken).toHaveBeenCalledWith('test-room', '', 'publisher');
    });

    it('should use viewer role when explicitly specified', async () => {
      const mockResponse = {
        token: 'mock-token',
        identity: 'user_123',
        url: 'ws://localhost:7880',
      };
      mockLiveKitService.generateToken.mockResolvedValue(mockResponse);

      await controller.getToken('test-room', 'alice', 'viewer');

      expect(service.generateToken).toHaveBeenCalledWith('test-room', 'alice', 'viewer');
    });

    it('should handle all parameters together', async () => {
      const mockResponse = {
        token: 'mock-token',
        identity: 'bob',
        url: 'ws://localhost:7880',
      };
      mockLiveKitService.generateToken.mockResolvedValue(mockResponse);

      const result = await controller.getToken('conference-room', 'bob', 'publisher');

      expect(service.generateToken).toHaveBeenCalledWith('conference-room', 'bob', 'publisher');
      expect(result).toEqual(mockResponse);
    });

    it('should pass through role value as-is to service', async () => {
      const mockResponse = {
        token: 'mock-token',
        identity: 'user_123',
        url: 'ws://localhost:7880',
      };
      mockLiveKitService.generateToken.mockResolvedValue(mockResponse);

      // Test that non-standard role values are passed through
      // Note: TypeScript types prevent this at compile time, but runtime behavior should be tested
      await controller.getToken('test-room', undefined, 'admin' as any);

      expect(service.generateToken).toHaveBeenCalledWith('test-room', '', 'admin');
    });
  });

  describe('health', () => {
    it('should return ok status', () => {
      const result = controller.health();
      expect(result).toEqual({ status: 'ok' });
    });
  });
});
