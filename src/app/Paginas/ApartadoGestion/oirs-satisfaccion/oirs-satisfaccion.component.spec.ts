import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OirsSatisfaccionComponent } from './oirs-satisfaccion.component';

describe('OirsSatisfaccionComponent', () => {
  let component: OirsSatisfaccionComponent;
  let fixture: ComponentFixture<OirsSatisfaccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OirsSatisfaccionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OirsSatisfaccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
