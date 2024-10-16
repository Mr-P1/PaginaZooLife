import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreasVisitadasComponent } from './areas-visitadas.component';

describe('AreasVisitadasComponent', () => {
  let component: AreasVisitadasComponent;
  let fixture: ComponentFixture<AreasVisitadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreasVisitadasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AreasVisitadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
