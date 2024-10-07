import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsoAplicacionComponent } from './uso-aplicacion.component';

describe('UsoAplicacionComponent', () => {
  let component: UsoAplicacionComponent;
  let fixture: ComponentFixture<UsoAplicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsoAplicacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsoAplicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
