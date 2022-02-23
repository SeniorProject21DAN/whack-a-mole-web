import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaintScreenComponent } from './paint-screen.component';

describe('PaintScreenComponent', () => {
  let component: PaintScreenComponent;
  let fixture: ComponentFixture<PaintScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaintScreenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaintScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
