import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficoOirsHoyComponent } from './grafico-oirs-hoy.component';

describe('GraficoOirsHoyComponent', () => {
  let component: GraficoOirsHoyComponent;
  let fixture: ComponentFixture<GraficoOirsHoyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficoOirsHoyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficoOirsHoyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
