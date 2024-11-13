import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitasHoyComponent } from './visitas-hoy.component';

describe('VisitasHoyComponent', () => {
  let component: VisitasHoyComponent;
  let fixture: ComponentFixture<VisitasHoyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitasHoyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitasHoyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
