import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponderOirsComponent } from './responder-oirs.component';

describe('ResponderOirsComponent', () => {
  let component: ResponderOirsComponent;
  let fixture: ComponentFixture<ResponderOirsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResponderOirsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResponderOirsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
