import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearBioparqueComponent } from './crear-bioparque.component';

describe('CrearBioparqueComponent', () => {
  let component: CrearBioparqueComponent;
  let fixture: ComponentFixture<CrearBioparqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearBioparqueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearBioparqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
