import { TestBed } from '@angular/core/testing';

import { GenerateSynthesisService } from './generate-synthesis.service';

describe('GenerateSynthesisService', () => {
  let service: GenerateSynthesisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenerateSynthesisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
