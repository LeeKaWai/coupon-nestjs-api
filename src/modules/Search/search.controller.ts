import { Get, Query, Controller } from '@nestjs/common';
// services
import { SearchService } from './search.service';

// models
import { SearchModel } from './models';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  public async find(@Query() query: SearchModel) {
    return this.searchService.search(query);
  }
}
