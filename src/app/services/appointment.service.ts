import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  // private apiUrl = 'http://localhost:8000/dashboard/estadisticas-citas/'; 
  private apiUrl = 'http://20.206.205.29:8000/dashboard/estadisticas-citas/'; 

  constructor(private http: HttpClient) {}

  // Método para obtener las estadísticas de citas con filtros aplicados
  getFilteredAppointments(doctorId?: string, mes?: number, anio?: number): Observable<any> {
    let params = new HttpParams();
    if (doctorId) params = params.set('doctor_id', doctorId);
    if (mes) params = params.set('mes', mes.toString());
    if (anio) params = params.set('anio', anio.toString());

    return this.http.get<any>(this.apiUrl, { params });
  }

  // Método para obtener las citas canceladas con filtros de doctor, mes y año
  getEsperaAppointments(doctorId?: string, mes?: number, anio?: number): Observable<any> {
    let params = new HttpParams();
    if (doctorId) params = params.set('doctor_id', doctorId);
    if (mes) params = params.set('mes', mes.toString());
    if (anio) params = params.set('anio', anio.toString());

    return this.http.get<any>(`${this.apiUrl}espera/`, { params });
  }
  getAppointmentsPastel(doctorId?: string, mes?: number, anio?: number): Observable<any> {
    let params = new HttpParams();
    if (doctorId) params = params.set('doctor_id', doctorId);
    if (mes) params = params.set('mes', mes.toString());
    if (anio) params = params.set('anio', anio.toString());

    return this.http.get<any>(`${this.apiUrl}concretadas-canceladas/`, { params });
  }

  // Obtener lista única de doctores
  getUniqueDoctors(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}unique-doctors/`);
  }

  // Obtener lista única de años
  getUniqueYears(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}unique-years/`);
  }
}
