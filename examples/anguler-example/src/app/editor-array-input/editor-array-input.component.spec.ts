import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorArrayInputComponent } from './editor-array-input.component';

describe('EditorArrayInputComponent', () => {
  let component: EditorArrayInputComponent;
  let fixture: ComponentFixture<EditorArrayInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditorArrayInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorArrayInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
