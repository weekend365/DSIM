import { Controller, Get } from '@nestjs/common';
import type { ApiResponse } from '@dsim/shared';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  getPlaceholder(): ApiResponse {
    return this.expensesService.getMessage();
  }
}
