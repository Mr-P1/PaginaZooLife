import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardEstadisticoComponent } from './dashboard-estadistico.component';

describe('DashboardEstadisticoComponent', () => {
  let component: DashboardEstadisticoComponent;
  let fixture: ComponentFixture<DashboardEstadisticoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardEstadisticoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardEstadisticoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
