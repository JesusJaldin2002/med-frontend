
import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../services/appointment.service';
import { Chart, ChartConfiguration } from 'chart.js';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';

PlotlyModule.plotlyjs = PlotlyJS;

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  standalone: true,
  imports: [HttpClientModule,CommonModule, PlotlyModule]
})
export class DashboardComponent implements OnInit {

  public graphData: any;
  public layout: any;

  public lineGraphData: any; // Para el gráfico lineal
  public lineLayout: any;

  public pieGraphData: any; // Datos para el gráfico de pastel
  public pieLayout: any;

  public promedioTotal:any;
  public doctors: any[] = [];  // Lista de doctores
  public years: number[] = []; // Lista de años únicos

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.loadAppointments();
    this.loadEsperaAppointments();
    this.loadAppointmentsPastel();
    this.loadUniqueDoctors();
    this.loadUniqueYears();
  }

  loadAppointments(doctorId?: string, mes?: number, anio?: number): void {
    this.appointmentService.getFilteredAppointments(doctorId, mes, anio).subscribe(
      data => {
        // Asume que el backend devuelve el JSON generado por Plotly con `data` y `layout`
        this.graphData = data.data; // Datos de Plotly
        this.layout = data.layout;  // Configuración de diseño de Plotly
      },
      error => console.error('Error al cargar datos:', error)
    );
  }
  loadEsperaAppointments(doctorId?: string, mes?: number, anio?: number): void {
    this.appointmentService.getEsperaAppointments(doctorId, mes, anio).subscribe(
      data => {
        // Configuración del gráfico lineal de citas canceladas
        this.lineGraphData = data.data;
        this.promedioTotal = data.layout.annotations[0].text;
        this.lineLayout = {
          title: 'Tiempo de espera promedio',
          xaxis: { title: 'Fecha' },
          yaxis: { title: 'Tiempo de espera' },
          hovermode: 'closest',
          annotations: [
            {
              x: 0.5,  // Centrado en el ancho del gráfico
              y: 1.1,  // Posición arriba del gráfico
              xref: 'paper', yref: 'paper',
              text: this.promedioTotal,
              showarrow: false,
              font: { size: 14, color: "black" }
            }
          ]
          
        };
      },
      error => console.error('Error al cargar datos de citas canceladas:', error)
    );
  }

  loadAppointmentsPastel(doctorId?: string, mes?: number, anio?: number): void {
    this.appointmentService.getAppointmentsPastel(doctorId, mes, anio).subscribe(
      data => {
        this.pieGraphData = data.data;
        this.pieLayout = {
          title: 'Distribución de Citas Concretadas y Canceladas',
          showlegend: true
        };
      },
      error => console.error('Error al cargar datos de citas concretadas:', error)
    );
  }

  loadUniqueDoctors(): void {
    this.appointmentService.getUniqueDoctors().subscribe(
      data => {
        this.doctors = data;
      },
      error => console.error('Error al cargar doctores únicos:', error)
    );
  }

  loadUniqueYears(): void {
    this.appointmentService.getUniqueYears().subscribe(
      data => {
        this.years = data;
      },
      error => console.error('Error al cargar años únicos:', error)
    );
  }


  applyFilters(doctorId: string, mes: string, anio: string): void {
    const month = mes ? parseInt(mes, 10) : undefined;
    const year = anio ? parseInt(anio, 10) : undefined;
  
    // Aplicar filtros a ambos gráficos
    this.loadAppointments(doctorId, month, year);
    this.loadEsperaAppointments(doctorId, month, year);
    this.loadAppointmentsPastel(doctorId, month, year);
  }
}
