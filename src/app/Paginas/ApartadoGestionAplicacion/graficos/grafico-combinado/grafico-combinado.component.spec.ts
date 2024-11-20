import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoCombinadoComponent } from './grafico-combinado.component';

describe('GraficoCombinadoComponent', () => {
  let component: GraficoCombinadoComponent;
  let fixture: ComponentFixture<GraficoCombinadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoCombinadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoCombinadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
