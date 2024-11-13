import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SatisfaccionPromedioComponent } from './satisfaccion-promedio.component';

describe('SatisfaccionPromedioComponent', () => {
  let component: SatisfaccionPromedioComponent;
  let fixture: ComponentFixture<SatisfaccionPromedioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SatisfaccionPromedioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SatisfaccionPromedioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
