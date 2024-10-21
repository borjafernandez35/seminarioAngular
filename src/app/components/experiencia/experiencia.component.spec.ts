import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExperienciaComponent } from './experiencia.component';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ExperienciaService } from '../../services/experiencia.service';
import { UserService } from '../../services/user.service';
import { of } from 'rxjs';

describe('ExperienciaComponent', () => {
  let component: ExperienciaComponent;
  let fixture: ComponentFixture<ExperienciaComponent>;
  let experienciaService: jasmine.SpyObj<ExperienciaService>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    const experienciaServiceSpy = jasmine.createSpyObj('ExperienciaService', ['getExperiencias', 'addExperiencia']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUsers']);

    await TestBed.configureTestingModule({
      declarations: [ExperienciaComponent],
      imports: [FormsModule, HttpClientTestingModule],
      providers: [
        { provide: ExperienciaService, useValue: experienciaServiceSpy },
        { provide: UserService, useValue: userServiceSpy }
      ]
    }).compileComponents();

    experienciaService = TestBed.inject(ExperienciaService) as jasmine.SpyObj<ExperienciaService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperienciaComponent);
    component = fixture.componentInstance;
    component.selectedParticipants = []; // Asegúrate de inicializar selectedParticipants
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an empty list of selected participants initially', () => {
    expect(component.selectedParticipants).toEqual([]); // Asegúrate de que selectedParticipants esté vacío inicialmente
  });

  it('should call getExperiencias on init', () => {
    expect(experienciaService.getExperiencias).toHaveBeenCalled();
  });

  it('should call getUsers on init', () => {
    expect(userService.getUsers).toHaveBeenCalled();
  });
});
