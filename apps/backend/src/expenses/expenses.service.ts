import { Injectable } from '@nestjs/common';
import type { ApiResponse } from '@dsim/shared';

@Injectable()
export class ExpensesService {
  getMessage(): ApiResponse {
    return { message: 'TODO: Implement expenses module' };
  }
}
