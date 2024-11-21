import { TestBed } from '@angular/core/testing';

import { SearchqueryService } from './searchquery.service';

describe('SearchqueryService', () => {
  let service: SearchqueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchqueryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
