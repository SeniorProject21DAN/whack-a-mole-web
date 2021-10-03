import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoleScreenComponent } from './mole-screen.component';

describe('MoleScreenComponent', () => {
  let component: MoleScreenComponent;
  let fixture: ComponentFixture<MoleScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoleScreenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoleScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
