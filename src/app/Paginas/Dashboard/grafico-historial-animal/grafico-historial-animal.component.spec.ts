import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoHistorialAnimalComponent } from './grafico-historial-animal.component';

describe('GraficoHistorialAnimalComponent', () => {
  let component: GraficoHistorialAnimalComponent;
  let fixture: ComponentFixture<GraficoHistorialAnimalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoHistorialAnimalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoHistorialAnimalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
