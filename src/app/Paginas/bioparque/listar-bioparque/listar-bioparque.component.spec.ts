import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarBioparqueComponent } from './listar-bioparque.component';

describe('ListarBioparqueComponent', () => {
  let component: ListarBioparqueComponent;
  let fixture: ComponentFixture<ListarBioparqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarBioparqueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarBioparqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
