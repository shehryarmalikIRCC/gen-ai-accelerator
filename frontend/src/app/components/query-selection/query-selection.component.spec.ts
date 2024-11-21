import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuerySelectionComponent } from './query-selection.component';

describe('QuerySelectionComponent', () => {
  let component: QuerySelectionComponent;
  let fixture: ComponentFixture<QuerySelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuerySelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuerySelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
