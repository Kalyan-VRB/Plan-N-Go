import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripForumComponent } from './trip-forum.component';

describe('TripForumComponent', () => {
  let component: TripForumComponent;
  let fixture: ComponentFixture<TripForumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripForumComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripForumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
