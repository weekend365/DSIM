import { Injectable } from '@nestjs/common';
import type { ApiResponse } from '@dsim/shared';

@Injectable()
export class LocationService {
  getMessage(): ApiResponse {
    return { message: 'TODO: Implement location module' };
  }
}
