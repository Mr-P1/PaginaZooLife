import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoHistorialPlantaComponent } from './grafico-historial-planta.component';

describe('GraficoHistorialPlantaComponent', () => {
  let component: GraficoHistorialPlantaComponent;
  let fixture: ComponentFixture<GraficoHistorialPlantaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoHistorialPlantaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoHistorialPlantaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
