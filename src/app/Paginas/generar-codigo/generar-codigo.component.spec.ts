import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarCodigoComponent } from './generar-codigo.component';

describe('GenerarCodigoComponent', () => {
  let component: GenerarCodigoComponent;
  let fixture: ComponentFixture<GenerarCodigoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerarCodigoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerarCodigoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
