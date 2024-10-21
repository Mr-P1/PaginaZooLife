import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OirsFelicitacionComponent } from './oirs-felicitacion.component';

describe('OirsFelicitacionComponent', () => {
  let component: OirsFelicitacionComponent;
  let fixture: ComponentFixture<OirsFelicitacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OirsFelicitacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OirsFelicitacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
