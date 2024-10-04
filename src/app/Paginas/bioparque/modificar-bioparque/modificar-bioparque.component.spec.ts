import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificarBioparqueComponent } from './modificar-bioparque.component';

describe('ModificarBioparqueComponent', () => {
  let component: ModificarBioparqueComponent;
  let fixture: ComponentFixture<ModificarBioparqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificarBioparqueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModificarBioparqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
