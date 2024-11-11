import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayActivityComponent } from './day-activity.component';

describe('DayActivityComponent', () => {
  let component: DayActivityComponent;
  let fixture: ComponentFixture<DayActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DayActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
