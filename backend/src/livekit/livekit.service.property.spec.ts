import { Test, TestingModule } from '@nestjs/testing';
import { LiveKitService } from './livekit.service';
import * as fc from 'fast-check';
import * as jwt from 'jsonwebtoken';

/**
 * Property-Based Tests for LiveKit Service
 * 
 * These tests validate universal properties that should hold for all inputs
 */
describe('LiveKitService - Property Tests', () => {
  let service: LiveKitService;

  beforeAll(() => {
    // Set up environment variables for testing
    process.env.LIVEKIT_API_KEY = 'test-api-key';
    process.env.LIVEKIT_API_SECRET = 'test-api-secret';
    process.env.LIVEKIT_URL = 'wss://test.livekit.cloud';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LiveKitService],
    }).compile();

    service = module.get<LiveKitService>(LiveKitService);
  });

  /**
   * Property 1: Token Permission Consistency
   * **Validates: Requirements 3.1, 3.2**
   * 
   * For any token generated with role R, the canPublish permission SHALL be 
   * true if and only if R equals "publisher".
   */
  describe('Property 1: Token Permission Consistency', () => {
    it('should set canPublish=true for publisher role and canPublish=false for viewer role', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random room names (alphanumeric with hyphens and underscores)
          fc.stringMatching(/^[a-zA-Z0-9_-]{1,50}$/),
          // Generate random participant names (optional, can be empty)
          fc.option(fc.stringMatching(/^[a-zA-Z0-9_-]{1,30}$/), { nil: '' }),
          // Generate random roles (publisher or viewer)
          fc.constantFrom('publisher' as const, 'viewer' as const),
          async (roomName, participantName, role) => {
            // Generate token with the random role
            const result = await service.generateToken(
              roomName,
              participantName || '',
              role
            );

            // Decode the JWT token (without verification since we're testing the structure)
            const decoded = jwt.decode(result.token) as any;

            // Verify the token was generated
            expect(decoded).toBeDefined();
            expect(decoded.video).toBeDefined();

            // Property assertion: canPublish should match the role
            if (role === 'publisher') {
              expect(decoded.video.canPublish).toBe(true);
            } else {
              expect(decoded.video.canPublish).toBe(false);
            }

            // Additional invariants that should always hold
            expect(decoded.video.canSubscribe).toBe(true);
            expect(decoded.video.canPublishData).toBe(true);
            expect(decoded.video.room).toBe(roomName);
            expect(decoded.video.roomJoin).toBe(true);
          }
        ),
        {
          numRuns: 100, // Run 100 random test cases
          verbose: true,
        }
      );
    });
  });

  /**
   * Property 3: Identity Uniqueness
   * **Validates: Requirements 2.4, 8.4**
   * 
   * When no participant name is provided, each token generation SHALL produce 
   * a unique identity.
   */
  describe('Property 3: Identity Uniqueness', () => {
    it('should generate unique identities when no participant name is provided', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate a random room name
          fc.stringMatching(/^[a-zA-Z0-9_-]{1,50}$/),
          // Generate a random number of token requests (between 2 and 20)
          fc.integer({ min: 2, max: 20 }),
          async (roomName, numTokens) => {
            // Generate multiple tokens without participant names
            const results = await Promise.all(
              Array.from({ length: numTokens }, () =>
                service.generateToken(roomName, '', 'viewer')
              )
            );

            // Extract all identities
            const identities = results.map((result) => result.identity);

            // Verify all identities are unique
            const uniqueIdentities = new Set(identities);
            expect(uniqueIdentities.size).toBe(identities.length);

            // Additional invariant: all identities should be non-empty strings
            identities.forEach((identity) => {
              expect(identity).toBeDefined();
              expect(typeof identity).toBe('string');
              expect(identity.length).toBeGreaterThan(0);
            });
          }
        ),
        {
          numRuns: 50, // Run 50 random test cases
          verbose: true,
        }
      );
    });
  });
});

