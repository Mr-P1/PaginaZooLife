import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EscaneoAreasHoyComponent } from './escaneo-areas-hoy.component';

describe('EscaneoAreasHoyComponent', () => {
  let component: EscaneoAreasHoyComponent;
  let fixture: ComponentFixture<EscaneoAreasHoyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscaneoAreasHoyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EscaneoAreasHoyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
