import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OirsReclamoComponent } from './oirs-reclamo.component';

describe('OirsReclamoComponent', () => {
  let component: OirsReclamoComponent;
  let fixture: ComponentFixture<OirsReclamoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OirsReclamoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OirsReclamoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
