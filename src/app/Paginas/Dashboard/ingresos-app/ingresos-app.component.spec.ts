import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresosAppComponent } from './ingresos-app.component';

describe('IngresosAppComponent', () => {
  let component: IngresosAppComponent;
  let fixture: ComponentFixture<IngresosAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngresosAppComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngresosAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
